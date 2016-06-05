'use strict';
const fs = require('fs');
const path = require('path');
const yeoman = require('yeoman-generator');
const inquirer = require('inquirer');
const chalk = require('chalk');
const yosay = require('yosay');
const changeCase = require('change-case');
const extend = require('extend');
const typings = require('typings-core');

const createGitCommands = require('./createGitCommands');
const createTemplateCommands = require('./createTemplateCommands');

const collectingSourceInfo = [];

const TEMPLATEVERSION = 0;
const GENERATORVERSION = '1.0';

module.exports = yeoman.Base.extend({
  constructor: function () {
    yeoman.Base.apply(this, arguments);

    this.argument('typingsName', { type: String, required: false, desc: `If specified, this will be used as the ${chalk.green('<repositoryName>')} and the repo will be created under this folder` });

    this.option('update-template', { desc: 'Update template', defaults: false });
    this.option('debug', { desc: 'Print debug info', defaults: false });

    this.props = {};
  },
  initializing: {
    changeDestinationRoot() {
      if (this.typingsName) {
        this.destinationRoot(this.typingsName);
      }
    },
    loadGitConfig() {
      this.git = createGitCommands(this, this.destinationPath());
      return Promise.all([
        this.git.loadConfig(),
        this.git.loadRepoInfo()
      ]).then((values) => {
        extend(this.props, values[0], values[1]);
      }, (err) => {
        this.log(chalk.red(err));
        process.exit(1);
      });
    },
    initTemplateCommands() {
      this.templateCommands = createTemplateCommands(this);
    }
  },
  prompting: {
    greeting() {
      this.log(yosay(`Welcome to the sensational ${chalk.yellow('typings')} generator!`));
    },
    retrieveConfigTemplate() {
      return this.templateCommands.retrieve()
      .then((configTemplate) => {
        this.configTemplate = configTemplate;
      });
    },
    enterSourceSection() {
      this.log('');
      this.log(`I'll be creating the ${chalk.yellow('typings')} repository under the ${chalk.cyan(this.typingsName ? this.typingsName : 'current')} folder`);
      this.log('');
      this.log(`To begin, I need to know a little bit about the ${chalk.green('source')} you are typings for.`);
    },
    askDelivery() {
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
            let jsonRaw = '';
            child.on('close', (code) => {
              if (code !== 0) {
                reject(`${chalk.red('Oops')}, could not find ${chalk.cyan(this.props.sourceDeliveryPackageName)}.`);
              }
              else {
                const result = JSON.parse(jsonRaw.toString());
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
              }
            });

            child.stderr.on('data', (data) => {
              try {
                const result = JSON.parse(data.toString());
                if (result.id === 'validate' || result.id === 'cached') {
                  this.props.sourceRepository = result.data.pkgMeta._source;
                }
              }
              catch (err) { }
            });
            child.stdout.on('data', (data) => {
              jsonRaw += data.toString();
            });
          }));
          break;
        case 'npm':
          collectingSourceInfo.push(new Promise((resolve, reject) => {
            const child = this.spawnCommand('npm', ['info', this.props.sourceDeliveryPackageName, '--json'], { stdio: [0, 'pipe'] });
            let jsonRaw = '';
            child.on('close', (code) => {
              if (code !== 0) {
                reject(`${chalk.red('Oops')}, could not find ${chalk.cyan(this.props.sourceDeliveryPackageName)}.`);
              }
              else {
                const pjson = JSON.parse(jsonRaw.toString());
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
                if (this.props.sourceRepository.indexOf('git+https') === 0) {
                  this.props.sourceRepository = this.props.sourceRepository.slice(4);
                }
                resolve();
              }
            });

            child.stdout.on('data', (data) => {
              jsonRaw += data.toString();
            });
          }));
          break;
      }
    },
    askUsage() {
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
          default: []
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
    askSourceTestHarness() {
      // Source-test is still in early stage. No automation.
    },
    enterTypingsSection() {
      this.log('');
      this.log(`Good, now about the ${chalk.yellow('typings')} itself...`);
    },
    useGeneratedValues() {
      return this.templateCommands.useGeneratedValues()
      .then((props) => {
        extend(this.props, props);
        if (!this.props.useGeneratedValues) {
          return this.templateCommands.askCustomValues()
          .then((props) => {
            extend(this.props, props);
          });
        }
      });
    },
    calcProperties() {
      const devPackages = ['onchange', 'typings', 'ts-node', 'tslint', 'tslint-config-typings'];
      const typingsPackages = [];
      const typingsGlobalPackages = []
      if (this.props.testFramework === 'blue-tape') {
        devPackages.push('tap-spec', 'blue-tape');
        typingsPackages.push('registry:npm/blue-tape');
        typingsGlobalPackages.push('registry:env/node');
      }
      switch (this.props.browserTestHarness) {
        case 'tape-run+jspm':
          devPackages.push('stream', 'jspm', 'tape-run');
          break;
        case 'tape-run+browserify':
          devPackages.push('globby', 'browserify', 'tsify', 'tape-run');
          break;
      }
      this.props.devDependencies = devPackages;
      this.props.typingsDevDependencies = typingsPackages;
      this.props.typingsGlobalDevDependencies = typingsGlobalPackages;
    },
    printDebugInfo() {
      if (this.options.debug) {
        this.log('');
        this.log(chalk.bgYellow('debug: props'));
        this.log(this.props);
        this.log(chalk.bgYellow('debug: configTemplate'));
        this.log(this.configTemplate);
      }
    },
  },
  writing: {
    // createGitHubRepo() {
    //   github.authenticate({
    //     type: 'basic',

    //   })
    // },
    // Git repo cloning need to be done before any file copy.
    createGitRepo() {
      if (this.options['skip-git']) return;

      // Assume the repo is cloned from remote
      if (this.git.repoExists) return;

      return this.git.clone(`https://github.com/${this.props.repositoryOrganization}/${this.props.repositoryName}.git`);
    },
    copyFiles() {
      if (this.options.skipWriting) return;

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
          main: this.props.sourceMain,
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
          license: this.props.license,
          generatorVersion: GENERATORVERSION
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
            'node npm-scripts/test \\"test/**/*.ts\\"' : 'echo no browser test',
          sourceMain: this.props.sourceMain,
          allTestScript: (() => {
            let tests = [];
            if (~this.props.sourcePlatforms.indexOf('node')) {
              tests.push('npm test');
            }
            if (~this.props.sourcePlatforms.indexOf('browser')) {
              tests.push('npm run browser-test')
            }
            return tests.join(' && ');
          })()
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

      var typedFilename;
      if (~this.props.sourceUsages.indexOf('esm')) {
        this.fs.copy(
          this.templatePath('template/esm.d.ts'),
          this.destinationPath(`${this.props.sourceMain}.d.ts`)
        );
      }
      else if (~this.props.sourceUsages.indexOf('commonjs') || ~this.props.sourceUsages.indexOf('amd')) {
        this.fs.copyTpl(
          this.templatePath('template/commonjs.d.ts'),
          this.destinationPath(`${this.props.sourceMain}.d.ts`),
          {
            name: this.props.sourceDeliveryPackageName
          }
        );
      }
      else {
        this.fs.copyTpl(
          this.templatePath('template/global.d.ts'),
          this.destinationPath(`${this.props.sourceMain}.d.ts`),
          {
            name: this.props.sourceDeliveryPackageName
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

      this.fs.copyTpl(
        this.templatePath('template/test_tsconfig.json'),
        this.destinationPath('test/tsconfig.json'),
        {
          sourceMain: this.props.sourceMain
        }
      );

      if (~this.props.sourceUsages.indexOf('commonjs')) {
        this.fs.write('test/test.ts',
          [
            `import test = require('${this.props.testFramework}');`,
            '',
            `import ${changeCase.camel(this.props.sourceDeliveryPackageName)} = require('${this.props.sourceDeliveryPackageName}');`,
            ''
          ].join('\n'));
      }
      else if (~this.props.sourceUsages.indexOf('esm')) {
        this.fs.write('test/test.ts',
          [
            `import test = require('${this.props.testFramework}');`,
            '',
            `import ${changeCase.camel(this.props.sourceDeliveryPackageName)} from '${this.props.sourceDeliveryPackageName}';`,
            ''
          ].join('\n'));
      }
      else if (~this.props.sourceUsages.indexOf('amd')) {
        this.fs.write('test/test.ts',
          [
            'define((require, module, exports) => {',
            `  import test = require('${this.props.testFramework}');`,
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
      if (this.options.skipInstall) return;

      this.log(`Installing ${chalk.cyan(this.props.sourceDeliveryPackageName)}...`);
      switch (this.props.sourceDeliveryType) {
        case 'bower':
          this.bowerInstall([this.props.sourceDeliveryPackageName], { 'save-dev': true, 'save-exact': true });
          break;
        case 'npm':
          this.npmInstall([this.props.sourceDeliveryPackageName], { 'save-dev': true, 'save-exact': true, 'progress': false });
          break;
      }
    },
    installDevDependencies() {
      if (this.options.skipInstall) return;

      this.npmInstall(this.props.devDependencies, { 'save-dev': true, 'progress': false, 'loglevel': 'silent' });
    },
    installTypingsPackages() {
      if (this.options.skipInstall) return;

      if (this.props.typingsDevDependencies.length > 0) {
        typings.installDependenciesRaw(this.props.typingsDevDependencies, { cwd: this.destinationPath(), saveDev: true });
      }
      if (this.props.typingsGlobalDevDependencies.length > 0) {
        typings.installDependenciesRaw(this.props.typingsGlobalDevDependencies, { cwd: this.destinationPath(), saveDev: true, global: true });
      }
    },
    submodule() {
      if (this.options.skipGit) return;

      this.log(`Submoduling ${chalk.green(this.props.sourceRepository)} into ${chalk.cyan('source')} folder...`);
      return this.git.addSubmodule(this.props.sourceRepository, 'source');
    },
    startShowQuotes() {
      this.log(chalk.yellow('Waiting for installion to complete...'));

      const quotes = [
        'typings 1.0 changed "ambient" to "global"',
        '"global" means the typings is declared globally (as a script file)',
        'typings.json/homepage shows up in "typings search" and "typings info"',
        'typings.json/version shows up when the consumer installs it',
        'most typings in DefinitelyTyped (dt~<package>) are "global"',
        'typings by default search for packages in typings/registry/npm',
        'you can use `typings info <package> --versions` to find out where is the typing repo',
        'you can use `-SG` in place of `--save --global` to save your fingers',
        'typings used in registry (except those for global) are written in top-level import/export declaration format',
        'you can configure .typingsrc for proxy settings',
        'you need to write runtime test for your typings, not just compile test'
      ];
      this.showingQuotes = setInterval(() => {
        this.log(chalk.yellow(`Installing...do you know that ${quotes[Math.round(Math.random() * quotes.length - 0.5)]}?`));
      }, 8000);
    },
  },
  end: {
    startShowQuotes() {
      clearInterval(this.showingQuotes);
    },
    isReady() {
      this.log('');
      this.log('I am done! Now it is your turn!');
      if (this.typingsName) {
        this.log('');
        this.log(`The typings repository is created under the ${this.typingsName} folder.`);
        this.log('Please cd into it to start working.');
      }
    },
    tsdHint() {
      this.log('');
      this.log('If DefinitelyTyped has a definition for the source,');
      this.log(` you can run ${chalk.green('typings install -G dt~<source>')} to download the file`);
      this.log(' so you can easily access those definitions.');
      this.log('You don\'t need to save it though.');
    },
    readyToTest() {
      this.log('');
      this.log(`Run ${chalk.green('npm run watch')}.`);
      this.log('It will automatically build and test the typings for you as you make changes.');
    },
    sayGoodbye() {
      this.log('');
      this.log('Thanks for helping the typings community!');
      this.log('');
      this.log('If you have any suggestion, please create an issue at:');
      this.log('  https://github.com/typings/generator-typings/issues');
      this.log('');
      this.log(`Hope you like it! :)`);
    }
  }
});
