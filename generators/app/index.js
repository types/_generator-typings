'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var changeCase = require('change-case');

module.exports = yeoman.generators.Base.extend({
  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay('Welcome to the sensational ' + chalk.red('typings') + ' generator!'));

    this.prompt({
      type: 'input',
      name: 'repo',
      message: 'What is the username/repo of the package you are writing this typings for?',
      default: 'username/repo'
    }, function (props) {
      this.sourceUrl = `https://github.com/${props.repo}`;
      this.sourcePackageName = props.repo.split('/')[1];
      this.prettyPackageName = changeCase.titleCase(this.sourcePackageName.replace('-', ' '));
      done();
    }.bind(this));
  },

  writing: function () {
    this.fs.copy(
      this.templatePath('**/*'),
      this.destinationPath()
      );
    this.fs.copy(
      this.templatePath('**/.*'),
      this.destinationPath()
      );
    var typeFileName = `${this.sourcePackageName}.d.ts`;

    var typings = { name: this.sourcePackageName, main: typeFileName };
    this.fs.writeJSON(this.destinationPath('typings.json'), typings);

    var tsconfig = {
      compilerOptions: {
        module: 'commonjs'
      },
      files: [typeFileName]
    };
    this.fs.writeJSON(this.destinationPath('tsconfig.json'), tsconfig);

    this.fs.write(typeFileName, '');

    this.fs.write('README.md',
      `# Typed ${this.prettyPackageName }\n` +
      `The type definition for [${this.sourcePackageName }](${this.sourceUrl }).`);

    this.fs.write('test/test.ts',
      `import * as ${this.sourcePackageName} from '${this.sourcePackageName}'`);

    this.log(`Run "typings install file:typings.json" when you are ready to test your definition in test/test.ts.`);
  }
});
