'use strict';
const path = require('path');
const yeoman = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const changeCase = require('change-case');
// const GitHubApi = require('github');
// const NodeGit = require('nodegit');

// const github = new GitHubApi({
//   version: "3.0.0",
//   protocol: "https",
//   host: "api.github.com",
//   timeout: 5000,
//   header: {
//     "user-agent": "generator-typings"
//   }
// });

module.exports = yeoman.Base.extend({
  initializing: {
    loadRepo() {
      //     const done = this.async();
      //     NodeGit.Repository.open(path.resolve('.')).then((repo) => {
      //       this.repo = repo;
      //       console.log('found repo');
      //       done();
      //     }, () => {
      //       console.log('repo not found');
      //       done();
      //     });
    }
  },
  prompting: {
    greeting() {
      this.log(yosay(`Welcome to the sensational ${chalk.yellow('typings')} generator!`));
    },
    askSource() {
      if (!this.options.beta) return;

      this.log('Welcome to the beta! Let me know if my questions make sense to you.');
      this.log('Now, let\'s get started...');
      this.log('');
      const done = this.async();
      this.log(`To begin, I need to know a little bit about the ${chalk.green('source')} you are typings for.`);
      this.log('');
      this.log('Beta note: some of these questions will be skipped in actual release');
      this.log('  if I can access the source and determine them myself.');

      const questions = [
        {
          type: 'list',
          name: 'delivery',
          message: `${chalk.green('Where')} can I it?`,
          choices: [
            { name: 'Bower', value: 'bower', disabled: 'coming soon...' },
            { name: 'Duo', value: 'duo', disabled: 'coming not so soon...' },
            { name: 'Jam', value: 'jam', disabled: 'coming not so soon...' },
            { name: 'JSPM', value: 'jspm', disabled: 'coming not so soon...' },
            { name: 'NPM', value: 'npm', checked: true },
            { name: 'volo', value: 'volo', disabled: 'coming not so soon...' },
          ]
        },
        {
          type: 'checkbox',
          name: 'kinds',
          message: `What ${chalk.green('kind(s)')} of package is it?`,
          choices: (props) => {
            return [
              { name: 'NPM', value: 'npm', checked: props.list === 'npm' },
              {
                name: 'github (Duo, JSPM, volo, etc)',
                value: 'github',
                checked: props.delivery === 'duo' || props.delivery === 'jspm' ||props.delivery === 'volo'
              },
              { name: 'Bower', value: 'bower', checked: props.delivery === 'bower' },
              { name: 'Jam', value: 'jam', checked: props.delivery === 'jam' },
              { name: 'Script (load in script tag)', value: 'global' },
              { name: 'Platform (e.g. atom)', value: 'env' },
            ]
          }
        },
        {
          type: 'input',
          name: 'npmName',
          when: (props) => props.packageManagers.indexOf('npm') !== -1,
          message: `What is the ${chalk.green('package name')} in ${chalk.cyan('NPM')}?`,
          default: (props) => props.repository,
          validate: (value) => value.length > 0,
        },
        {
          type: 'input',
          name: 'bowerName',
          message: `What is the ${chalk.green('package name')} in  ${chalk.cyan('Bower')}?`,
          default: (props) => props.npmName || props.repository,
          validate: (value) => value.length > 0,
          when: (props) => props.packageManagers.indexOf('bower') !== -1,
        }];

      const hostQuestions = [
        {
          type: 'list',
          name: 'host',
          message: `Where is the package ${chalk.green(`hosted`)}?`,
          choices: [
            // { name: 'BitBucket', value: 'bitbucket' },
            // { name: 'CodePlex', value: 'codeplex' },
            { name: 'GitHub', value: 'github' },
            // { name: 'GitLab', value: 'gitlab' },
            // { name: 'SourceForge', value: 'sourceforge' },
            { name: 'hosted privately', value: 'private' },
          ],
          default: 'github'
        },
        {
          type: 'input',
          name: 'author',
          message: (props) => {
            switch (props.host) {
              case 'github':
                return `http://github.com/${chalk.green('<author>')}/repository?`;
              case 'private':
                return `Who is the ${chalk.green('author')}?`;
            }
          },
          validate: (value) => value.length > 0,
        },
        {
          type: 'input',
          name: 'repository',
          message: (props) => {
            switch (props.host) {
              case 'github':
                return `http://github.com/${props.author}/${chalk.green('<repository>')}?`;
            }
          },
          validate: (value) => value.length > 0,
          when: (props) => props.host !== 'private',
        },
        {
          type: 'checkbox',
          name: 'platforms',
          message: `Which ${chalk.green('platform')} does the package run on?`,
          choices: [
            { name: 'Node', value: 'node' },
            { name: 'Browser', value: 'browser' },
            { name: 'Others (e.g. atom)', value: 'others' }
          ],
          validate: (answers) => answers.length > 0,
        },
        {
          type: 'list',
          name: 'format',
          message: `What is the ${chalk.green('format')} of the package?`,
          choices: (props) => {
            const moduleId = props.npmName || props.bowerName || prop.repository;
            const moduleName = changeCase.camelCase(moduleId);
            return [
              { name: 'AMD (RequireJS)', value: 'amd' },
              { name: 'CommonJS (NodeJS)', value: 'commonjs' },
              { name: 'global', value: 'global' },
              { name: 'ES2015 Module', value: 'esm' },
              { name: 'System (SystemJS)', value: 'system' },
              { name: 'TypeScript', value: 'typescript' },
              { name: 'UMD (global + AMD + CommonJS)', value: 'umd' },
              { name: 'UMD (global + CommonJS)', value: 'umd2' },
            ];
          }
        },
      ];

      this.prompt(questions, (props) => {
        this.source = props;
        console.log(props);
        done();
      });
    },
  },
  end: {
    sayGoodbye() {
      this.log('That\'s it for the Beta right now. Thanks for trying it out!');
      this.log('');
      this.log('If you have any suggestion, please create an issue at:');
      this.log('  https://github.com/typings/generator-typings/issues');
      this.log('');
      this.log(`Hope you like the current version ${chalk.green('(until 1.0 is out)!')} :)`);
    }
  }
});
