'use strict'
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const rc = require('rc');
const extend = require('extend');

const TEMPLATEVERSION = 0;
const globalConfigPath = path.join(process.env[process.platform === 'win32'? 'USERPROFILE': 'HOME'], '.generator-typingsrc');


module.exports = function createTemplateCommmands(generator) {

  let configTemplate;

  function retrieve() {
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

    configTemplate = rc('generator-typings', defaultConfigTemplate);

    let updating;
    if (generator.options.updateTemplate) {
      generator.log(`You want to update your ${chalk.green('template')}? Here it goes...`);
      updating = update();
    }
    else if (typeof configTemplate.version === 'undefined') {
      generator.log(`Seems like this is the ${chalk.cyan('first time')} you use this generator.`);
      generator.log(`Let's quickly setup the ${chalk.green('template')}...`);
      updating = update();
    }
    else if (configTemplate.version !== TEMPLATEVERSION) {
      generator.log(`Seems like you have ${chalk.cyan('updated')} this generator. The template has changed.`);
      generator.log(`Let's quickly update the ${chalk.green('template')}...`);
      updating = update();
    }

    if (updating) {
      return updating.then((configTemplate) => {
        generator.log('Got it! The template is saved.');
        return configTemplate;
      });
    }
    else {
      return Promise.resolve(configTemplate);
    }
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
  function useGeneratedValues() {
    let genProps = generateProps();
    generator.log('Based on your configured template, ...');
    generator.log(`${chalk.green('repository')}: ${chalk.cyan(`${genProps.repositoryOrganization}/${genProps.repositoryName}`)}`);
    generator.log(`${chalk.green('Github username')}: ${chalk.cyan(genProps.username)}`);
    generator.log(`${chalk.green('license')}: ${chalk.cyan(genProps.license)}`);
    generator.log(`${chalk.green('license signature')}: ${chalk.cyan(genProps.licenseSignature)}`);
    generator.log(`${chalk.green('test framework')}: ${chalk.cyan(genProps.testFramework)}`);
    if (genProps.browserTestHarness) {
      generator.log(`${chalk.green('brower test harness')}: ${chalk.cyan(genProps.browserTestHarness)}`);
    }

    return generator.prompt([
      {
        type: 'confirm',
        name: 'useGeneratedValues',
        message: 'Does it look good to you?',
        default: true
      }
    ]).then((props) => {
      if (props.useGeneratedValues) {
        extend(props, genProps);
      }

      return props;
    });
  }
  function askCustomValues() {
    return generator.prompt([
      {
        type: 'confirm',
        name: 'useExistingRepository',
        message: 'I notice you are in a git repository. Is this the typings repository you created?',
        when: () => generator.props.git,
        default: true
      },
      {
        type: 'input',
        name: 'repositoryOrganization',
        message: `https://github.com/${chalk.green('<organization>')}/...`,
        default: () => generator.props.useExistingRepository ?
          generator.props.repositoryOrganization :
          generator.configTemplate.repositoryOrganization,
        validate: (value) => value.length > 0
      },
      {
        type: 'input',
        name: 'repositoryName',
        message: (props) => `https://github.com/${chalk.cyan(props.repositoryOrganization)}/${chalk.green('<name>')}`,
        default: () => generator.props.useExistingRepository ?
          generator.props.repositoryName :
          generator.configTemplate.repositoryNamePrefix + generator.props.sourceDeliveryPackageName,
        validate: (value) => value.length > 0
      },
      {
        type: 'input',
        name: 'username',
        message: `Your username on ${chalk.green('GitHub')}`,
        default: generator.configTemplate.username,
        validate: (value) => value.length > 0,
      },
      {
        type: 'list',
        name: 'testFramework',
        message: `Your ${chalk.green('test framework')} of choice`,
        choices: ['blue-tape'],
        default: generator.configTemplate.testFramework,
        when: ~generator.props.sourcePlatforms.indexOf('node'),
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
                // { name: 'tape-run + browserify', value: 'tape-run+browserify' },
                { name: 'tape-run + jspm', value: 'tape-run+jspm' },
              ];
          }
        },
        default: generator.configTemplate.browserTestHarness,
        when: ~generator.props.sourcePlatforms.indexOf('browser'),
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
        default: generator.configTemplate.license,
      },
      {
        type: 'input',
        name: 'licenseSignature',
        message: `Your signature in the license: Copyright (c) ${new Date().getFullYear()} ${chalk.green('<signature>')}`,
        default: (props) => generator.configTemplate.licenseSignature,
      }
    ]);
  }
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
    retrieve,
    useGeneratedValues,
    askCustomValues
  }
}
