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
      name: 'url',
      message: 'What is the url of the package you are writing this typings for?',
      default: 'https://github.com/...'
    }, function (props) {
      this.sourceUrl = props.url;
      if (this.sourceUrl.indexOf('github.com') === -1) {
        this.log.error('Sorry, only support github package at the moment. Help wanted!');
        process.exit(1);
      } else {
        this.sourcePackageName = /.*github\.com[^\/]*\/[^\/]*\/([^\/]*)/.exec(this.sourceUrl)[1];
        this.prettyPackageName = changeCase.titleCase(this.sourcePackageName.replace('-', ' '));
      }
      done();
    }.bind(this));
  },

  writing: function () {
    this.fs.copy(
      this.templatePath(''),
      this.destinationPath()
      );
    this.fs.copy(
      this.templatePath('**/.*'),
      this.destinationPath()
      );
    var typings = {name: this.sourcePackageName, main: 'main.d.ts', browser: 'browser.d.ts'};
    this.fs.writeJSON(this.destinationPath('typings.json'), typings);
    this.fs.write('README.md',
      `# Typed ${this.prettyPackageName}\n` +
      `The type definition for [${this.sourcePackageName}](${this.sourceUrl}).`);
  }
});
