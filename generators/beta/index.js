'use strict';
const fs = require('fs');
const path = require('path');
const url = require('url');
const yeoman = require('yeoman-generator');
const inquirer = require('inquirer');
const chalk = require('chalk');
const yosay = require('yosay');
const changeCase = require('change-case');
const rc = require('rc');
const extend = require('extend');
const typings = require('typings-core');

const simpleGit = require('simple-git');

// const GitHubApi = require('github');

// const github = new GitHubApi({
//   version: "3.0.0",
//   protocol: "https",
//   host: "api.github.com",
//   timeout: 5000,
//   header: {
//     "user-agent": "generator-typings"
//   }
// });

const collectingSourceInfo = [];
const collectingLocalInfo = [];

const TEMPLATEVERSION = 0;
const globalConfigPath = path.join(process.env.HOME, '.generator-typingsrc');


module.exports = yeoman.Base.extend({
  constructor: function () {
    yeoman.Base.apply(this, arguments);
    this.option('skip-prompting', { hide: true });
    this.option('skip-writing', { hide: true });
    this.option('update-template', { desc: 'Update template', defaults: false });
    this.props = {};
    this.updateConfigTemplate = function () {
      const questions = [
        {
          type: 'input',
          name: 'username',
          message: `Your username on ${chalk.green('GitHub')}`,
          default: this.configTemplate.username,
        },
        {
          type: 'input',
          name: 'repositoryOrganization',
          message: (props) => `https://github.com/${chalk.green('<organization>')}/${this.configTemplate.repositoryNamePrefix}*`,
          default: (props) => this.configTemplate.repositoryOrganization || props.username,
        },
        {
          type: 'input',
          name: 'repositoryNamePrefix',
          message: (props) => {
            return `https://github.com/${props.repositoryOrganization}/${chalk.green(this.configTemplate.repositoryNamePrefix)}*`
          },
          default: this.configTemplate.repositoryNamePrefix,
        },
        {
          type: 'list',
          name: 'testFramework',
          message: `Your ${chalk.green('test framework')} of choice`,
          choices: ['blue-tape'],
          default: this.configTemplate.testFramework,
        },
        {
          type: 'list',
          name: 'browserTestHarness',
          message: `Your ${chalk.cyan('browser')} ${chalk.green('test harness')}`,
          choices: (props) => {
            switch (props.testFramework) {
              case 'blue-tape':
              default:
                return [
                  { name: 'tap-run + browserify', value: 'tap-run+browserify' },
                  { name: 'tap-run + jspm', value: 'tap-run+jspm' },
                ];
            }
          },
          default: this.configTemplate.browserTestHarness,
        },
        {
          type: 'list',
          name: 'license',
          message: `Which ${chalk.green('license')} do you want to use?`,
          choices: [
            { name: 'Apache 2.0', value: 'Apache-2.0' },
            { name: 'MIT', value: 'MIT' },
            { name: 'Unlicense', value: 'unlicense' },
            { name: 'FreeBSD', value: 'BSD-2-Clause-FreeBSD' },
            { name: 'NewBSD', value: 'BSD-3-Clause' },
            { name: 'Internet Systems Consortium (ISC)', value: 'ISC' },
            { name: 'No License (Copyrighted)', value: 'nolicense' }
          ],
          default: this.configTemplate.license,
        },
        {
          type: 'input',
          name: 'licenseSignature',
          message: `Your signature in the license: Copyright (c) ${new Date().getFullYear()} ${chalk.green('<signature>')}`,
          default: (props) => this.configTemplate.licenseSignature || props.username,
        },
      ];

      return this.prompt(questions).then((props) => {
        props.version = TEMPLATEVERSION;
        this.configTemplate = props;
        this.configTemplate.default = false;
        fs.writeFileSync(globalConfigPath, JSON.stringify(this.configTemplate));
        this.log('Got it! The template is saved.')
      });
    };
    this.applyConfigTemplate = function () {
      this.props.username = this.configTemplate.username;
      this.props.repositoryName = this.props.repositoryName || this.configTemplate.repositoryNamePrefix + this.props.sourceDeliveryPackageName;
      this.props.repositoryOrganization = this.props.repositoryOrganization || this.configTemplate.repositoryOrganization;
      this.props.repositoryRemoteUrl = this.props.repositoryRemoteUrl || `https://github.com/${this.props.repositoryOrganization}/${this.props.repositoryName}.git`;

      this.props.license = this.configTemplate.license;
      this.props.licenseSignature = this.configTemplate.licenseSignature;

      if (~this.props.sourcePlatforms.indexOf('node')) {
        this.props.testFramework = this.configTemplate.testFramework;
      }

      if (~this.props.sourcePlatforms.indexOf('browser')) {
        this.props.browserTestHarness = this.configTemplate.browserTestHarness;
      }
    };

    this.readGitConfig = function readGitConfig(name) {
      return new Promise((resolve, reject) => {
        var result;
        const child = this.spawnCommand('git', ['config', name], { stdio: [0, 'pipe'] });
        child.on('close', (code) => {
          resolve(result);
        });

        child.stdout.on('data', (data) => {
          result = data.toString().trim();
        });
      });
    };

    this.loadGitConfig = function loadGitConfig(repositoryPath) {
      return Promise.all([
        new Promise((resolve, reject) => {
          repositoryPath = path.resolve(repositoryPath);
          var result = {
            repositoryName: path.basename(repositoryPath),
            repositoryOrganization: path.basename(path.join(repositoryPath, '..'))
          };

          if (fs.existsSync(path.join(repositoryPath, '.git'))) {
            var git = simpleGit(repositoryPath);
            result.git = git;
            git.getRemotes(true, (err, out) => {
              const origins = out.filter((entry) => {
                return entry.name === 'origin';
              });

              if (origins.length === 1) {
                result.repositoryRemoteUrl = origins[0].refs.fetch;
                const u = url.parse(result.repositoryRemoteUrl);

                const parts = u.pathname.substring(1).split('/', 2);
                result.repositoryName = parts[1].substr(0, parts[1].length - 4);
                result.repositoryOrganization = parts[0];
              }

              resolve(result);
            });
          }
          else {
            resolve(result);
          }
        }),
        this.readGitConfig('user.username'),
        this.readGitConfig('user.name'),
        this.readGitConfig('user.email'),
      ]).then((results) => {
        var result = results[0];
        result.username = results[1];
        result.name = results[2];
        result.email = results[3];
        return result;
      });
    };
  },
  initializing: {
    loadRepo() {
      collectingLocalInfo.push(
        this.loadGitConfig('.').then((value) => {
          extend(this.props, value);
        })
      );
    }
  },
  prompting: {
    betaGreeting() {
      this.log('Welcome to the beta! Let me know if my questions make sense to you.');
      this.log('Now, let\'s get started...');
      this.log('');
    },
    greeting() {
      this.log(yosay(`Welcome to the sensational ${chalk.yellow('typings')} generator!`));
    },
    waitForLocalInfo() {
      const done = this.async();
      Promise.all(collectingLocalInfo).then(
        () => done(),
        (err) => {
          this.log(err);
          process.exit(1);
        });
    },
    loadConfigTemplate() {
      // Missing `version` indicate it is the default config.
      const defaultConfigTemplate = {
        username: this.props.username,
        repositoryNamePrefix: 'typed-',
        repositoryOrganization: undefined,
        license: 'MIT',
        testFramework: 'blue-tape',
        browserTestHarness: 'tape-run+browserify'
      };

      this.configTemplate = rc('generator-typings', defaultConfigTemplate);

      if (this.options.updateTemplate) {
        this.log(`You want to update your ${chalk.green('template')}? Here it goes...`);
        this.updateConfigTemplate();
      }
      else if (typeof this.configTemplate.version === 'undefined') {
        if (this.options['skip-prompting']) return;

        this.log(`Seems like this is the ${chalk.cyan('first time')} you use this generator.`);
        this.log(`Let's quickly setup the ${chalk.green('template')}...`);

        this.updateConfigTemplate();
      }
      else if (this.configTemplate.version !== TEMPLATEVERSION) {
        if (this.options['skip-prompting']) return;

        this.log(`Seems like you have ${chalk.cyan('updated')} this generator. The template has changed.`);
        this.log(`Let's quickly update the ${chalk.green('template')}...`);

        this.updateConfigTemplate();
      }
    },
    enterSourceSection() {
      this.log('');
      this.log(`To begin, I need to know a little bit about the ${chalk.green('source')} you are typings for.`);
    },
    askDelivery() {
      if (this.options['skip-prompting']) return;

      const questions = [
        {
          type: 'list',
          name: 'sourceDeliveryType',
          message: `Where can I get it ${chalk.green('from')}?`,
          choices: [
            { name: 'Bower', value: 'bower' },
            { name: 'CDN or http(s)', value: 'http' },
            // { name: 'Duo', value: 'duo', disabled: 'coming not so soon...' },
            // { name: 'Jam', value: 'jam', disabled: 'coming not so soon...' },
            // { name: 'JSPM', value: 'jspm', disabled: 'coming not so soon...' },
            { name: 'NPM', value: 'npm' },
            // { name: 'volo', value: 'volo', disabled: 'coming not so soon...' },
            { name: 'cannot be downloaded', value: 'none' },
          ],
          default: 'npm'
        },
        {
          type: 'input',
          name: 'sourceDeliveryPackageName',
          message: (props) => {
            switch (props.sourceDeliveryType) {
              case 'http':
              case 'none':
                return `What is the ${chalk.green('name')} of the package?`;
              default:
                return `${chalk.cyan(props.sourceDeliveryType)} install ${chalk.green('<package name>')}?`;
            }
          },
          validate: (value) => value.length > 0,
        },
        {
          type: 'input',
          name: 'sourceDeliveryPackageUrl',
          message: `What is the ${chalk.green('url')} of the package?`,
          validate: (value) => value.length > 0,
          when: (props) => props.sourceDeliveryType === 'http',
        },
      ];

      return this.prompt(questions).then((props) => {
        extend(this.props, props);
      });
    },
    getInfoFromDelivery() {
      if (this.options['skip-prompting']) return;

      if (this.props.sourceDeliveryType !== 'none') {
        this.log(`gathering info from ${chalk.cyan(this.props.sourceDeliveryType)}...`);
      }

      switch (this.props.sourceDeliveryType) {
        case 'http':
        case 'none':
          this.props.sourceMain = 'index';

          return this.prompt([
            {
              type: 'input',
              name: 'sourceVersion',
              message: `What is the ${chalk.green('version')} of the package?`,
              validate: (value) => value.length > 0,
              when: (props) => ['http', 'none'].indexOf(props.type) !== -1,
            },
            {
              type: 'input',
              name: 'sourceHomepage',
              message: `Enter the ${chalk.green('homepage')} of the package (if any)`,
            },
          ]).then((props) => {
            this.props.sourceVersion = props.sourceVersion;
            this.props.sourceHomepage = props.sourceHomepage;
          });
          break;
        case 'bower':
          collectingSourceInfo.push(new Promise((resolve, reject) => {
            const child = this.spawnCommand('bower', ['info', this.props.sourceDeliveryPackageName, '--json'], { stdio: [0, 'pipe'] });
            child.on('close', (code) => {
              if (code !== 0) {
                reject(`${chalk.red('Oops')}, could not find ${chalk.cyan(this.props.sourceDeliveryPackageName)}.`);
              }
            });

            child.stderr.on('data', (data) => {
              try {
                const result = JSON.parse(data.toString());
                console.log('stderr', result);
                if (result.id === 'validate' || result.id === 'cached') {
                  this.props.sourceRepository = result.data.pkgMeta._source;
                }
              }
              catch (err) { }
            });
            child.stdout.on('data', (data) => {
              const result = JSON.parse(data.toString());
              console.log('stdout', result);
              if (result.latest.main) {
                const main = path.parse(result.latest.main);
                this.props.sourceMain = path.join(main.dir, main.name);
              }
              else {
                this.props.sourceMain = 'index';
              }
              this.props.sourceVersion = result.latest.version;
              this.props.sourceHomepage = result.latest.homepage;
              resolve();
            });
          }));
          break;
        case 'npm':
          collectingSourceInfo.push(new Promise((resolve, reject) => {
            const child = this.spawnCommand('npm', ['info', this.props.sourceDeliveryPackageName, '--json'], { stdio: [0, 'pipe'] });
            child.on('close', (code) => {
              if (code !== 0) {
                reject(`${chalk.red('Oops')}, could not find ${chalk.cyan(this.props.sourceDeliveryPackageName)}.`);
              }
            });

            child.stdout.on('data', (data) => {
              const pjson = JSON.parse(data.toString());
              if (pjson.main) {
                const main = path.parse(pjson.main);
                this.props.sourceMain = path.join(main.dir, main.name);
              }
              else {
                this.props.sourceMain = 'index';
              }
              this.props.sourceVersion = pjson.version;
              this.props.sourceHomepage = pjson.homepage;
              this.props.sourceRepository = pjson.repository && pjson.repository.url ?
                pjson.repository.url : pjson.repository;
              resolve();
            });
          }));
          break;
      }
    },
    askUsage() {
      if (this.options['skip-prompting']) return;

      return this.prompt(
        {
          type: 'checkbox',
          name: 'sourceUsages',
          message: `${chalk.green('How')} can the package be used?`,
          choices: [
            { name: 'AMD Module', value: 'amd' },
            { name: 'CommonJS Module', value: 'commonjs', checked: true },
            { name: 'ES2015 Module', value: 'esm' },
            { name: 'Script Tag', value: 'script' },
            { name: 'part of environment', value: 'env' }
          ],
          validate: (values) => values.length > 0,
        }).then((props) => {
          this.props.sourceUsages = props.sourceUsages;
        });
    },
    askPlatform() {
      if (this.options['skip-prompting']) return;

      return this.prompt(
        {
          type: 'checkbox',
          name: 'sourcePlatforms',
          message: `${chalk.green('Where')} can the package be used?`,
          choices: [
            { name: 'Browser', value: 'browser' },
            { name: 'Native NodeJS', value: 'node', checked: true },
            { name: 'others (e.g. atom)', value: 'others' },
          ],
          validate: (values) => values.length > 0,
        }).then((props) => {
          this.props.sourcePlatforms = props.sourcePlatforms;
        });
    },
    waitForSourceInfo() {
      const done = this.async();
      Promise.all(collectingSourceInfo).then(() => {
        done();
      }, (err) => {
        this.log(err);
        process.exit(1);
      });
    },
    askTestHarness() {
      // Source-test is still in early stage. No automation.
    },
    enterTypingsSection() {
      this.log('');
      this.log(`Good, now about the ${chalk.yellow('typings')} itself...`);
    },
    confirmQuickSetup() {
      this.log('Based on your configured template, ...');
      this.log('<<print out default props>>');
      return this.prompt([
        {
          type: 'confirm',
          name: 'usePresetValues',
          message: 'Does it look good to you?',
          default: true
        }
      ]).then((props) => {
        extend(this.props, props);
        if (props.usePresetValues) {
          this.applyConfigTemplate();
        }
      });
    },
    confirmExistingRepository() {
      if (this.props.usePresetValues || !this.props.git) return
      return this.prompt([
        {
          type: 'confirm',
          name: 'useExistingRepository',
          message: 'I notice you are in a git repository. Is this the typings repository you created?',
          default: true
        },
      ]).then((props) => {
        extend(this.props, props);
      });
    },
    askRepositoryInfo() {
      if (this.props.usePresetValues) return;
      return this.prompt([
        {
          type: 'input',
          name: 'repositoryOrganization',
          message: `https://github.com/${chalk.green('<organization>')}/...`,
          default: () => this.props.useExistingRepository ?
            this.props.repositoryOrganization :
            this.configTemplate.repositoryOrganization,
          validate: (value) => value.length > 0
        },
        {
          type: 'input',
          name: 'repositoryName',
          message: (props) => `https://github.com/${chalk.cyan(props.repositoryOrganization)}/${chalk.green('<name>')}`,
          default: () => this.props.useExistingRepository ?
            this.props.repositoryName :
            this.configTemplate.repositoryNamePrefix + this.props.sourceDeliveryPackageName,
          validate: (value) => value.length > 0
        },
      ]).then((props) => {
        extend(this.props, props);
        if (!this.props.repositoryRemoteUrl) {
          this.props.repositoryRemoteUrlToAdd = `https://github.com/${props.repositoryOrganization}/${props.repositoryName}.git`;
        }
      });
    },
    askGitHubInfo() {
      if (this.props.usePresetValues || this.props.repositoryRemoteUrl) return;
      return this.prompt([
        {
          type: 'input',
          name: 'username',
          message: `Your username on ${chalk.green('GitHub')}`,
          default: this.configTemplate.username,
          validate: (value) => value.length > 0,
        }]).then((props) => {
          extend(this.props, props);
        });
    },
    askTestFramework() {
      if (this.props.usePresetValues) return;
      return this.prompt([
        {
          type: 'list',
          name: 'testFramework',
          message: `Your ${chalk.green('test framework')} of choice`,
          choices: ['blue-tape'],
          default: this.configTemplate.testFramework,
          when: ~this.props.sourcePlatforms.indexOf('node'),
        },
        {
          type: 'list',
          name: 'browserTestHarness',
          message: `Your ${chalk.cyan('browser')} ${chalk.green('test harness')}`,
          choices: (props) => {
            switch (props.testFramework) {
              case 'blue-tape':
              default:
                return [
                  { name: 'tap-run + browserify', value: 'tap-run+browserify' },
                  { name: 'tap-run + jspm', value: 'tap-run+jspm' },
                ];
            }
          },
          default: this.configTemplate.browserTestHarness,
          when: ~this.props.sourcePlatforms.indexOf('browser'),
        },
      ]);
    },
    askLicenseInfo() {
      if (this.props.usePresetValues) return;
      return this.prompt([
        {
          type: 'list',
          name: 'license',
          message: `Which ${chalk.green('license')} do you want to use?`,
          choices: [
            { name: 'Apache 2.0', value: 'Apache-2.0' },
            { name: 'MIT', value: 'MIT' },
            { name: 'Unlicense', value: 'unlicense' },
            { name: 'FreeBSD', value: 'BSD-2-Clause-FreeBSD' },
            { name: 'NewBSD', value: 'BSD-3-Clause' },
            { name: 'Internet Systems Consortium (ISC)', value: 'ISC' },
            { name: 'No License (Copyrighted)', value: 'nolicense' }
          ],
          default: this.configTemplate.license,
        },
        {
          type: 'input',
          name: 'licenseSignature',
          message: `Your signature in the license: Copyright (c) ${new Date().getFullYear()} ${chalk.green('<signature>')}`,
          default: (props) => this.configTemplate.licenseSignature,
        },
      ]).then((props) => {
        extend(this.props, props);
      });
    },
    calcProperties() {
      const devPackages = ['onchange', 'typings', 'ts-node', 'tslint', 'tslint-config-typings'];
      const typingsPackages = [];
      if (this.props.testFramework === 'blue-tape') {
        devPackages.push('tap-spec', 'blue-tape');
        typingsPackages.push('registry:npm/blue-tape');
      }
      switch (this.props.browserTestHarness) {
        case 'tape-run+jspm':
          devPackage.push('stream', 'jspm', 'tape-run');
          break;
        case 'tape-run+browserify':
          devPackages.push('globby', 'browserify', 'tsify', 'tape-run');
          break;
      }
      this.props.devDependencies = devPackages;
      this.props.typingsDevDependencies = typingsPackages;
    },
    printProps() {
      this.log('');
      this.log('');
      this.log('');

      this.log(this.props);
    },
  },
  writing: {
    copyFiles() {
      if (this.options['skip-writing']) return;

      this.fs.copy(
        this.templatePath('*'),
        this.destinationPath()
      );
      this.fs.copy(
        this.templatePath('.*'),
        this.destinationPath()
      );

      // `.gitignore` needs to be name as NOT `.gitignore` because NPM will automatically rename it to `.npmignore`
      this.fs.copy(
        this.templatePath('template/_.gitignore'),
        this.destinationPath('.gitignore')
      );

      this.fs.copyTpl(
        this.templatePath('template/typings.json'),
        this.destinationPath('typings.json'),
        {
          name: this.props.sourceDeliveryPackageName,
          main: this.props.sourceMain + '.d.ts',
          homepage: this.props.sourceHomepage,
          version: this.props.sourceVersion
        });

      this.fs.copyTpl(
        this.templatePath('template/README.md'),
        this.destinationPath('README.md'),
        {
          prettyPackageName: changeCase.titleCase(this.props.sourceDeliveryPackageName.replace('-', ' ')),
          sourcePackageName: this.props.sourceDeliveryPackageName,
          sourcePackageUrl: this.props.sourceRepository,
          organization: this.props.repositoryOrganization,
          packageName: this.props.repositoryName,
          license: this.props.license
        });


      this.fs.copyTpl(
        this.templatePath('template/package.json'),
        this.destinationPath('package.json'),
        {
          ambient: !(~this.props.sourceUsages.indexOf('commonjs') ||
            ~this.props.sourceUsages.indexOf('amd') ||
            ~this.props.sourceUsages.indexOf('esm')) ? ' --ambient' : '',
          sourceTest: 'echo no source test',
          test: ~this.props.sourcePlatforms.indexOf('node') ? 'cd test && ts-node ../node_modules/blue-tape/bin/blue-tape \\"**/*.ts\\" | tap-spec' : 'echo no server test',
          browserTest: ~this.props.sourcePlatforms.indexOf('browser') ?
            'node npm-scripts/test "test/**.*.ts"' : 'echo no browser test',
          sourceMain: this.props.sourceMain
        });

      if (this.props.sourceDeliveryType === 'bower') {
        this.fs.copyTpl(
          this.templatePath('template/bower.json'),
          this.destinationPath('bower.json'),
          {
            packageName: this.props.repositoryName
          }
        );
      }

      this.fs.copyTpl(
        this.templatePath(`template/${this.props.license}.txt`),
        this.destinationPath('LICENSE'),
        {
          year: (new Date()).getFullYear(),
          author: this.props.licenseSignature.trim()
        }
      );

      this.fs.copy(
        this.templatePath('source-test/*'),
        this.destinationPath('source-test')
      );

      this.fs.copy(
        this.templatePath('test/*'),
        this.destinationPath('test')
      );

      if (~this.props.sourceUsages.indexOf('commonjs')) {
        this.fs.write('test/test.ts',
          [
            `import tape = require('${this.props.testFramework}');`,
            '',
            `import ${changeCase.camel(this.props.sourceDeliveryPackageName)} = require('${this.props.sourceDeliveryPackageName}');`,
            ''
          ].join('\n'));
      } else if (~this.props.sourceUsages.indexOf('esm')) {
        this.fs.write('test/test.ts',
          [
            `import tape = require('${this.props.testFramework}');`,
            '',
            `import ${changeCase.camel(this.props.sourceDeliveryPackageName)} from '${this.props.sourceDeliveryPackageName}';`,
            ''
          ].join('\n'));
      } else if (~this.props.sourceUsages.indexOf('amd')) {
        this.fs.write('test/test.ts',
          [
            'define((require, module, exports) => {',
            `  import tape = require('${this.props.testFramework}');`,
            '',
            `  import ${changeCase.camel(this.props.sourceDeliveryPackageName)} = require('${this.props.sourceDeliveryPackageName}');`,
            '',
            '});'
          ].join('\n'));
      }
      switch (this.props.browserTestHarness) {
        case 'tape-run+jspm':
          this.fs.copy(
            this.templatePath('npm-scripts/tape-jspm.test.js_'),
            this.destinationPath('npm-scripts/test.js')
          );
          break;
        case 'tape-run+browserify':
          this.fs.copy(
            this.templatePath('npm-scripts/tape-browserify.test.js_'),
            this.destinationPath('npm-scripts/test.js')
          );
          break;
      }
    }
  },
  install: {
    installSourcePackage() {
      this.log(`Installing ${chalk.cyan(this.props.sourceDeliveryPackageName)}...`);
      switch (this.props.sourceDeliveryType) {
        case 'bower':
          this.bowerInstall([this.props.sourceDeliveryPackageName], { 'save-dev': true, 'save-exact': true });
          break;
        case 'npm':
          this.npmInstall([this.props.sourceDeliveryPackageName], { 'save-dev': true, 'save-exact': true });
          break;
      }
    },
    installDevDependencies() {
      this.npmInstall(this.props.devDependencies, { 'save-dev': true })
    },
    installTypingsPackages() {
      if (this.props.typingsDevDependencies.length > 0) {
        typings.installDependenciesRaw(this.props.typingsDevDependencies, { cwd: this.destinationPath(), saveDev: true });
      }
    },
    // createGitHubRepo() {
    //   github.authenticate({
    //     type: 'basic',

    //   })
    // },
    createGitRepo() {
      if (this.git) return;
      this.git = simpleGit().init();
    },
    submodule() {
      const done = this.async();
      this.log(`Downloading ${chalk.green(this.props.sourceRepository)}...`);
      this.git.submoduleAdd(this.props.sourceRepository, 'source', done);
    },
    // initCommit() {
    //   this.git.add('./*')
    //     .commit('init commit');
    // }
    addRemote() {
      const done = this.async();
      this.git.getRemotes(true, (result) => {
        // assume when there is remote, it is correctly pointing to github.
        if (!result) {
          this.git.addRemote('origin', `https://github.com/${this.props.username}/${this.props.repositoryName}.git`)
        }

        this.git.push(['-u', 'origin', 'master'], () => {
          done();
        });
      });
    },
  },
  end: {
    sayGoodbye() {
      this.log('');
      this.log('That\'s it for the Beta right now. Thanks for trying it out!');
      this.log('');
      this.log('If you have any suggestion, please create an issue at:');
      this.log('  https://github.com/typings/generator-typings/issues');
      this.log('');
      this.log(`Hope you like the current version ${chalk.green('(until 1.0 is out)!')} :)`);
    }
  }
});
