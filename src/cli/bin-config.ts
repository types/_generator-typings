import { CliBuilder } from 'clibuilder'
import chalk = require('chalk')
import inquirer = require('inquirer')
import Promise = require('any-promise')

import { optionsToChoices } from '../utils/Options'
import { read, where, save, Config, Features, CONFIGVERSION } from '../config'

export function configure(program: CliBuilder) {
  program
    .command('config')
    .option('-l, --list', 'list all')
    .option('-u, --update', 'update config with prompts')
    .option('-w, --where', 'show where the config is saved')
    .action<void, any>((args, options) => {
      if (options.list) {
        program.log(getPrintMessage(read()))
      }
      else if (options.where) {
        program.log(where() || 'no config found')
      }
      else if (options.update) {
        update(program)
      }
      else {
        return false
      }
    })
}
export function update(program: CliBuilder) {
  let config = read()
  return prompt(config)
    .then(config => {
      config.version = CONFIGVERSION
      config = save(config)
      program.log('config updated.')
      return config
    })
}

export function getPrintMessage(config: Config) {
  const result: string[] = []
  for (const key in config) {
    if (key === 'version') {
      // Do not print version value
      continue
    }
    result.push(`${chalk.cyan(key)} = ${chalk.green(config[key])}`)
  }
  return result.join('\n')
}

export function prompt(config: Config): Promise<Config> {
  const questions: inquirer.Question[] = [{
    type: 'input',
    name: 'githubUsername',
    message: `Your username on ${chalk.green('GitHub')}`,
    default: config.githubUsername
  },
  {
    type: 'input',
    name: 'githubOrganization',
    message: () => `https://github.com/${chalk.green('<organization>')}/<repo>`,
    default: (props: any) => config.githubOrganization || props.username
  },
  {
    type: 'checkbox',
    name: 'lint',
    message: `How do you want to ${chalk.green('lint')} your code`,
    choices: optionsToChoices(Features.lint.options),
    default: config.lint
  },
  {
    type: 'list',
    name: 'serverTest',
    message: `Your ${chalk.green('test framework')} of choice on ${chalk.cyan('server')}`,
    choices: optionsToChoices(Features.serverTest.options),
    default: config.serverTest
  },
  {
    type: 'list',
    name: 'browserTest',
    message: `Your ${chalk.green('test framework')} of choice on ${chalk.cyan('browser')}`,
    choices: optionsToChoices(Features.browserTest.options),
    default: config.browserTest
  },
  {
    type: 'list',
    name: 'browserTestHarness',
    message: `Your ${chalk.cyan('browser')} ${chalk.green('test harness')}`,
    choices: (props: Config & inquirer.Answers) => {
      switch (props.browserTest) {
        case 'ava':
          return [
            Features.browserTestHarness.options.jsdom
          ]
        default:
        case 'blue-tape':
          return optionsToChoices(Features.browserTestHarness.options)
      }
    },
    default: config.browserTestHarness
  },
  {
    type: 'confirm',
    name: 'githubRepositoryCreation',
    message: `Can I create ${chalk.cyan('github')} repository ${chalk.green('automatically')} for you?`,
    default: config.githubRepositoryCreation
  },
  {
    type: 'confirm',
    name: 'sourceSubmodule',
    message: `Do you want to download ${chalk.cyan('source')} repository as ${chalk.green('submodule')}?`,
    default: config.sourceSubmodule
  },
  {
    type: 'confirm',
    name: 'travis',
    message: `Do you use ${chalk.green('travis')}?`,
    default: config.travis
  },
  {
    type: 'confirm',
    name: 'appveyor',
    message: `Do you use ${chalk.green('appveyor')}?`,
    default: config.appveyor
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
    default: config.license
  },
  {
    type: 'input',
    name: 'licenseSignature',
    message: `Your signature in the license: Copyright (c) ${new Date().getFullYear()} ${chalk.green('<signature>')}`,
    default: (props: Config) => config.licenseSignature || props.githubUsername
  }]

  return inquirer.prompt(questions) as any
}
