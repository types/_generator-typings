'use strict';
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var changeCase = require('change-case');

var licenses = [
  { name: 'Apache 2.0', value: 'Apache-2.0' },
  { name: 'MIT', value: 'MIT' },
  { name: 'Unlicense', value: 'unlicense' },
  { name: 'FreeBSD', value: 'BSD-2-Clause-FreeBSD' },
  { name: 'NewBSD', value: 'BSD-3-Clause' },
  { name: 'Internet Systems Consortium (ISC)', value: 'ISC' },
  { name: 'No License (Copyrighted)', value: 'nolicense' }
];

module.exports = yeoman.generators.Base.extend({
  prompting: {
    greeting() {
      this.log(yosay('Welcome to the sensational ' + chalk.red('typings') + ' generator!'));
    },
    sourceUri() {
      var done = this.async();

      const uriExamples = [
        'facebook/react',
        'atom/atom',
        'microsoft/vscode',
        'angular/angular'
      ];

      this.prompt({
        type: 'input',
        name: 'sourceUri',
        message: `What is the ${chalk.green('author/module') } of the ${chalk.red('source') } on github?`,
        default: () => uriExamples[Math.round(Math.random() * 4 - 0.5)],
        validate: (value) => value.length > 0
      }, (props) => {
        this.sourceUri = props.sourceUri;
        this.sourcePackageUrl = `https://github.com/${props.sourceUri}`;
        this.sourcePackageName = props.sourceUri.split('/')[1];
        this.prettyPackageName = changeCase.titleCase(this.sourcePackageName.replace('-', ' '));
        done();
      });
    },
    projectUri() {
      var done = this.async();
      var folder = path.basename(this.env.cwd);
      var parentFolder = path.basename(path.dirname(this.env.cwd));

      this.prompt({
        type: 'input',
        name: 'projectUri',
        message: `What will be the ${chalk.green('author/module') } for ${chalk.red('this typing') }?`,
        default: () => `${parentFolder}/${folder}`,
        validate: (value) => value.length > 0 && value.split('/').length === 2
      }, (props) => {
        var parts = props.projectUri.split('/');
        this.organization = parts[0];
        this.packageName = parts[1];
        done();
      });
    },
    username() {
      var done = this.async();

      this.prompt({
        type: 'input',
        name: 'username',
        message: 'And your GitHub username is...',
        validate: (value) => value.length > 0,
        store: true
      }, (props) => {
        this.username = props.username;
        done();
      });
    },
    license() {
      var done = this.async();

      this.prompt({
        type: 'list',
        name: 'license',
        message: 'Which license do you want to use?',
        default: 'MIT',
        choices: licenses
      }, (props) => {
        this.license = props.license;
        done();
      });
    },
    nameOnLicense() {
      var done = this.async();

      this.prompt({
        type: 'input',
        name: 'name',
        message: 'Name to use on the license?',
        default: this.username
      }, (props) => {
        this.nameOnLicense = props.name;
        done();
      });
    }
  },

  writing: {
    copyFiles() {
      this.fs.copy(
        this.templatePath('.vscode/*'),
        this.destinationPath('.vscode')
        );
      this.fs.copy(
        this.templatePath('test/*'),
        this.destinationPath('test')
        );
      this.fs.copy(
        this.templatePath('*'),
        this.destinationPath()
        );
      this.fs.copy(
        this.templatePath('.*'),
        this.destinationPath()
        );
    },
    createTypings() {
      var typings = { name: this.sourcePackageName, main: 'main.d.ts' };
      this.fs.writeJSON(this.destinationPath('typings.json'), typings);
    },
    createTsconfig() {
      var tsconfig = {
        compilerOptions: {
          module: 'commonjs',
          moduleResolution: 'node'
        },
        // TODO: add ambient source typings file
        files: ['main.d.ts', 'typings/main.d.ts']
      };
      this.fs.writeJSON(this.destinationPath('tsconfig.json'), tsconfig);
    },
    createREADME() {
      this.fs.write('README.md',
        `# Typed ${this.prettyPackageName}\n` +
        `The type definition for [${this.sourcePackageName }](${this.sourcePackageUrl}).\n` +
        '\n' +
        '# LICENSE\n' +
        `${this.license}\n`);
    },
    createTest() {
      this.fs.write('test/test.ts',
        `import * as ${this.sourcePackageName} from '${this.sourcePackageName}'`);
    },
    updatePackageJson() {
      this.fs.copyTpl(
        this.templatePath('template/package.json'),
        this.destinationPath('package.json'),
        {
          username: this.username,
          packageName: this.packageName,
          sourcePackageName: this.sourcePackageName,
          sourcePackageUrl: this.sourcePackageUrl,
          organization: this.origanization
        });
    },
    createLICENSE() {
      var filename = `template/${this.license}.txt`;
      var author = this.nameOnLicense.trim();

      this.fs.copyTpl(
        this.templatePath(filename),
        this.destinationPath('LICENSE'),
        {
          year: (new Date()).getFullYear(),
          author: author
        }
        );
    }
  },
  install: {
    npm() {
      this.log(`Running ${chalk.green('npm install') }...`);
      this.spawnCommandSync('npm', ['install']);
    }
  },
  end: {
    isReady() {
      this.log('');
      this.log('I am done! Now it is your turn!');
    },
    readyToTest() {
      this.log('');
      this.log('When you are ready to test your definition,');
      this.log(`Run ${chalk.green('typings install -D file:main.d.ts') }`);
      this.log('  and see the result in test/test.ts!');
    }
  }
});
