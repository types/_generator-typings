'use strict'
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const rc = require('rc');

const TEMPLATEVERSION = 0;
const globalConfigPath = path.join(process.env.HOME, '.generator-typingsrc');


module.exports = function createTemplateCommmands(generator) {

  let configTemplate;

  function loadOrCreate() {
    // Missing `version` indicates it is the default config.
    const defaultConfigTemplate = {
      username: generator.props.username,
      repositoryNamePrefix: 'typed-',
      repositoryOrganization: generator.props.username,
      testFramework: 'blue-tape',
      browserTestHarness: 'tape-run+jspm',
      license: 'MIT',
      licenseSignature: generator.props.username,
    };
    return configTemplate = rc('generator-typings', defaultConfigTemplate);
  }

  function update() {
    const questions = [
      {
        type: 'input',
        name: 'username',
        message: `Your username on ${chalk.green('GitHub')}`,
        default: configTemplate.username,
      },
      {
        type: 'input',
        name: 'repositoryOrganization',
        message: (props) => `https://github.com/${chalk.green('<organization>')}/${configTemplate.repositoryNamePrefix}*`,
        default: (props) => configTemplate.repositoryOrganization || props.username,
      },
      {
        type: 'input',
        name: 'repositoryNamePrefix',
        message: (props) => {
          return `https://github.com/${props.repositoryOrganization}/${chalk.green(configTemplate.repositoryNamePrefix)}*`
        },
        default: configTemplate.repositoryNamePrefix,
      },
      {
        type: 'list',
        name: 'testFramework',
        message: `Your ${chalk.green('test framework')} of choice`,
        choices: ['blue-tape'],
        default: configTemplate.testFramework,
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
                // tsify not working with TS 1.9 yet
                // { name: 'tape-run + browserify', value: 'tape-run+browserify' },
                { name: 'tape-run + jspm', value: 'tape-run+jspm' },
              ];
          }
        },
        default: configTemplate.browserTestHarness,
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
        default: configTemplate.license,
      },
      {
        type: 'input',
        name: 'licenseSignature',
        message: `Your signature in the license: Copyright (c) ${new Date().getFullYear()} ${chalk.green('<signature>')}`,
        default: (props) => configTemplate.licenseSignature || props.username,
      },
    ];

    return generator.prompt(questions).then((props) => {
      props.version = TEMPLATEVERSION;
      configTemplate = props;

      if (!generator.options.skipCache) {
        fs.writeFileSync(globalConfigPath, JSON.stringify(configTemplate));
      }

      return configTemplate;
    });
  };
  function generateProps() {
    const repoName = generator.typingsName || generator.props.repositoryName || configTemplate.repositoryNamePrefix + generator.props.sourceDeliveryPackageName
    let props = {
      username: configTemplate.username,
      repositoryName: repoName,
      repositoryOrganization: generator.props.repositoryOrganization || configTemplate.repositoryOrganization,
      license: configTemplate.license,
      licenseSignature: configTemplate.licenseSignature,
    };

    if (~generator.props.sourcePlatforms.indexOf('node')) {
      props.testFramework = configTemplate.testFramework;
    }

    if (~generator.props.sourcePlatforms.indexOf('browser')) {
      props.testFramework = configTemplate.testFramework;
      props.browserTestHarness = configTemplate.browserTestHarness;
    }

    return props;
  };

  return {
    loadOrCreate,
    update,
    generateProps
  }
}
