'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
// var extend = require('deep-extend');
var changeCase = require('change-case');

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
        message: `What is the ${chalk.green('source') } author/module name?`,
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
    packageName() {
      var done = this.async();

      this.prompt({
        type: 'input',
        name: 'packageName',
        message: 'Can I name this project as',
        default: () => `typed-${this.sourcePackageName}`,
        validate: (value) => value.length > 0
      }, (props) => {
        this.packageName = props.packageName;
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
    }
  },

  writing: {
    copyFiles() {
      this.fs.copy(
        this.templatePath('**/*'),
        this.destinationPath()
        );
      this.fs.copy(
        this.templatePath('**/.*'),
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
        files: ['main.d.ts', 'typings/main.d.ts'] // TODO: add ambient source typings file
      };
      this.fs.writeJSON(this.destinationPath('tsconfig.json'), tsconfig);
    },
    createREADME() {
      this.fs.write('README.md',
        `# Typed ${this.prettyPackageName}\n` +
        `The type definition for [${this.sourcePackageName }](${this.sourceUrl}).`);
    },
    createTest() {
      this.fs.write('test/test.ts',
        `import * as ${this.sourcePackageName} from '${this.sourcePackageName}'`);
    },
    updatePackageJson() {
      var pkg = this.fs.read(this.destinationPath('package.json'));
      console.log(this.packageName, this.sourcePackageUrl, this.sourcePackageName, this.username);
      pkg = pkg.replace('{username}', this.username);
      pkg = pkg.replace('{packageName}', this.packageName);
      pkg = pkg.replace('{sourcePackageName}', this.sourcePackageName);
      pkg = pkg.replace('{sourcePackageUrl}', this.sourcePackageUrl);
      this.fs.write(this.destinationPath('package.json'), pkg);

      // Don't know why it doesn't work.
      // var pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
      // extend(pkg, {
      //   packageName: this.packageName,
      //   sourcePackageUrl: this.sourcePackageUrl,
      //   sourcePackageName: this.sourcePackageName,
      //   username: this.username
      // });
      // this.fs.writeJSON(this.destinationPath('package.json'), pkg);
    },
    updateLICENSE() {
      var lic = this.fs.read(this.destinationPath('LICENSE'));
      lic = lic.replace('{username}', this.username);
      this.fs.write(this.destinationPath('LICENSE'), lic);
    }
  },
  install: {
    npm() {
      this.log(`Running ${chalk.green('npm install')}...`);
      this.spawnCommandSync('npm', ['install']);
    }
  },
  end: {
    goodbye() {

      this.log(`Almost ready! Run ${chalk.green(`typings install ${this.sourcePackageName} --ambient"`) }`);
      this.log('  to get a copy of the DefinitelyTyped file (if available)');
      this.log('  so you have something to start with!');
    }
  }
});
