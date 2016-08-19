import { join } from 'path'
import { homedir } from 'os'
import { writeFile } from 'fs'
import chalk = require('chalk')
import inquirer = require('inquirer')
import Promise = require('any-promise')
import extend = require('xtend')
import { CliBuilder } from 'clibuilder'

import { PROJECT_NAME } from './utils/constants'
import { readRaw } from './config.utils'
import { optionsToChoices } from './utils/Options'

export const CONFIGVERSION = 2
export const GLOBAL_OLD_CONFIG_PATH = join(homedir(), `.generator-typingsrc`)
export const GLOBAL_CONFIG_PATH = join(homedir(), `.${PROJECT_NAME}rc`)

export const features = {
  lint: {
    description: 'enable lint',
    options: {
      typings: 'Uses tslint-config-typings',
      none: 'Do not lint (strongly discouraged)'
    }
  },
  serverTest: {
    description: 'enable server testing (when applicable)',
    options: {
      'blue-tape': '',
      'ava': ''
      // 'mocha': '',
      // 'jasmine2': ''
      // 'vows': ''
      // 'tape': ''
    }
  },
  browserTest: {
    description: 'enable browser testing (when applicable)',
    options: {
      'blue-tape': '',
      'ava': ''
      // 'jasmine2': 'Jasmine 2'
    }
  },
  browserTestHarness: {
    descripton: 'how to run browser testing',
    options: {
      // tsify not working with TS 1.9 yet
      // 'tape-run+tsify': 'tape-run with tsify',
      'tape-run+jspm': 'tape-run with jspm',
      'jsdom': ''
    }
  },
  githubRepositoryCreation: {
    description: 'automatically create github repository'
  },
  sourceSubmodule: {
    description: 'add source package as submodule'
  },
  travis: {
    description: 'add travis support'
  },
  appveyor: {
    description: 'add appveyor support'
  }
}
export const questions = {
  githubUsername: {
    type: 'input',
    name: 'githubUsername',
    message: `Your username on ${chalk.green('GitHub')}`
  },
  githubOrganization: {
    type: 'input',
    name: 'githubOrganization',
    message: `https://github.com/${chalk.green('<organization>')}/<repo>`
  },
  repositoryNamePrefix: {
    type: 'input',
    name: 'repositoryNamePrefix',
    message: (props: any) => {
      return `https://github.com/${props.githubOrganization}/${chalk.green('<prefix>')}<source-name>`
    }
  },
  lint: {
    type: 'checkbox',
    name: 'lint',
    message: `How do you want to ${chalk.green('lint')} your code`,
    choices: optionsToChoices(features.lint.options)
  },
  serverTest: {
    type: 'list',
    name: 'serverTest',
    message: `Your ${chalk.green('test framework')} of choice on ${chalk.cyan('server')}`,
    choices: optionsToChoices(features.serverTest.options)
  },
  browserTest: {
    type: 'list',
    name: 'browserTest',
    message: `Your ${chalk.green('test framework')} of choice on ${chalk.cyan('browser')}`,
    choices: optionsToChoices(features.browserTest.options)
  },
  browserTestHarness: {
    type: 'list',
    name: 'browserTestHarness',
    message: `Your ${chalk.cyan('browser')} ${chalk.green('test harness')}`,
    choices: (props: Config) => {
      switch (props.browserTest) {
        case 'ava':
          return [
            features.browserTestHarness.options.jsdom
          ]
        default:
        case 'blue-tape':
          return optionsToChoices(features.browserTestHarness.options)
      }
    }
  },
  githubRepositoryCreation: {
    type: 'confirm',
    name: 'githubRepositoryCreation',
    message: `Can I create ${chalk.cyan('github')} repository ${chalk.green('automatically')} for you?`
  },
  sourceSubmodule: {
    type: 'confirm',
    name: 'sourceSubmodule',
    message: `Do you want to download ${chalk.cyan('source')} repository as ${chalk.green('submodule')}?`
  },
  travis: {
    type: 'confirm',
    name: 'travis',
    message: `Do you use ${chalk.green('travis')}?`
  },
  appveyor: {
    type: 'confirm',
    name: 'appveyor',
    message: `Do you use ${chalk.green('appveyor')}?`
  },
  license: {
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
    ]
  },
  licenseSignature: {
    type: 'input',
    name: 'licenseSignature',
    message: `Your signature in the license: Copyright (c) ${new Date().getFullYear()} ${chalk.green('<signature>')}`
  }
}

export interface Config {
  githubUsername: string
  githubOrganization: string
  repositoryNamePrefix: string
  license: 'Apache-2.0' | 'MIT' | 'unlicense' | 'BSD-2-Clause-FreeBSD' | 'BSD-3-Clause' | 'ISC' | 'nolicense'
  licenseSignature: string
  lint?: boolean
  serverTest?: 'blue-tape' | 'ava'
  browserTest?: 'blue-tape' | 'ava'
  browserTestHarness?: 'tape-run+jspm' | 'jsdom'
  githubRepositoryCreation?: boolean
  sourceSubmodule?: boolean
  travis?: boolean
  appveyor?: boolean
  version?: number
  isOldConfig?: boolean
}

export function where(): string | undefined {
  const currentConfig = readRaw()
  // the `config` property is assed by `rc` storing location of the file.
  return (currentConfig as any).config
}

/**
 * Read config.
 * Note: cannot test cases when there is no config because we cannot control where `rc()` reads file.
 */
export function read() {
  const config = readRaw()

  // These are added automatically by `rc()`
  delete (config as any)._
  delete (config as any).l
  delete (config as any).config
  delete (config as any).configs
  return config
}

export function save(config: Config) {
  writeFile(GLOBAL_CONFIG_PATH, JSON.stringify(config))
  return config
}

export function isDefault(template: Config) {
  return !template.version
}

export function needsUpdate(template: Config) {
  return isDefault(template) || template.version !== CONFIGVERSION
}

export function checkAndUpdate(program: CliBuilder) {
  const conf = read()
  let configReady = Promise.resolve(conf)
  if (isDefault(conf)) {
    program.log(`Seems like this is the ${chalk.cyan('first time')} you use this generator.`)
    program.log(`Let's quickly setup the ${chalk.green('config template')}...`)
    configReady = update(program)
  }
  else if (needsUpdate(conf)) {
    program.log(`Seems like you have ${chalk.cyan('updated')} this generator. The config template has changed.`)
    program.log(`Let's quickly update the ${chalk.green('config template')}...`)
    configReady = update(program)
  }

  return configReady
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

export function prompt(config: Config): Promise<Config> {
  const keys = Object.keys(questions)
  return inquirer.prompt(keys.map(key => extend(questions[key], { default: config[key] }))) as any
}
