import { join } from 'path'
import { homedir } from 'os'
import { writeFile } from 'fs'
import chalk = require('chalk')
import inquirer = require('inquirer')
import Promise = require('any-promise')

import { Options } from './utils/Options'
import { PROJECT_NAME } from './utils/constants'
import { createDefaultTemplate, readConfig, readOldConfig, convertOldConfig } from './config.utils'

const CONFIGVERSION = 1
export const GLOBAL_OLD_CONFIG_PATH = join(homedir(), `.generator-typingsrc`)
export const GLOBAL_CONFIG_PATH = join(homedir(), `.${PROJECT_NAME}rc`)

export interface Config {
  githubUsername: string,
  githubOrganization: string,
  license: 'Apache-2.0' | 'MIT' | 'unlicense' | 'BSD-2-Clause-FreeBSD' | 'BSD-3-Clause' | 'ISC' | 'nolicense',
  licenseSignature: string,
  mode: 'no-prompt' | 'no-test' | 'with-test',
  features: Array<'source' | 'travis' | 'appveyor'>,
  serverTestFramework?: 'blue-tape' | 'ava' | 'mocha' | 'vows' | 'tape',
  browserTestFramework?: 'blue-tape' | 'ava' | 'jasmine2',
  browserTestHarness?: 'tape-run+jspm' | 'jsdom',
  version?: number,
  isOldConfig?: boolean
}

export interface ConfigOptions extends Options {
  list?: boolean
  update?: boolean
  where?: boolean
}

export interface ConfigKeyOptions extends Options {
  options: boolean
}

export function where(): string | undefined {
  const currentConfig = read()
  // the `config` property is assed by `rc` storing location of the file.
  return (currentConfig as any).config
}

export function update() {
  const currentConfig = read()
  return prompt(currentConfig)
    .then(config => {
      return save(config)
    })
}

/**
 * Read config.
 * Note: cannot test cases when there is no config because we cannot control where `rc()` reads file.
 */
export function read() {
  const defaultTemplate = createDefaultTemplate()
  const configTemplate = readConfig()
  // the `config` property is assed by `rc` storing location of the file.
  if (!(configTemplate as any).config) {
    const oldConfig = readOldConfig()
    return (oldConfig as any).config ? convertOldConfig(oldConfig) : defaultTemplate
  }

  return configTemplate
}

export function save(config: Config) {
  return writeFile(GLOBAL_CONFIG_PATH, JSON.stringify(config))
}

export function isDefault(template: Config) {
  return !template.version
}

export function needsUpdate(template: Config) {
  return isDefault(template) || template.version !== CONFIGVERSION
}

export function prompt(template: Config): Promise<Config> {
  const questions: inquirer.Question[] = [{
    type: 'input',
    name: 'githubUsername',
    message: `Your username on ${chalk.green('GitHub')}`,
    default: template.githubUsername
  },
  {
    type: 'input',
    name: 'githubOrganization',
    message: () => `https://github.com/${chalk.green('<organization>')}/<repo>`,
    default: (props: any) => template.githubOrganization || props.username
  },
  {
    type: 'list',
    name: 'mode',
    message: `The default ${chalk.cyan('setup')} ${chalk.green('mode')}`,
    choices: [
      'no-prompt',
      'no-test',
      'with-test'
    ],
    default: template.mode
  },
  {
    type: 'checkbox',
    name: 'features',
    message: `Select the additional ${chalk.green('features')} you wan to add to the repository`,
    choices: (props: Config & inquirer.Answers) => {
      const choices = [{ name: `${chalk.green('source')}: add source package as submodule`, value: 'source' }]
      if (props.mode === 'with-test') {
        choices.push(
          { name: `${chalk.green('travis')}: add travis support`, value: 'travis' },
          { name: `${chalk.green('appveyor')}: add appveyor support`, value: 'appveyor' }
        )
      }

      return choices
    },
    default: template.features
  },
  {
    type: 'list',
    name: 'serverTestFramework',
    message: `Your ${chalk.green('test framework')} of choice on ${chalk.cyan('server')}`,
    choices: ['blue-tape', 'ava'],
    default: template.serverTestFramework
  },
  {
    type: 'list',
    name: 'browserTestFramework',
    message: `Your ${chalk.green('test framework')} of choice on ${chalk.cyan('browser')}`,
    choices: ['blue-tape', 'ava'],
    default: template.browserTestFramework
  },
  {
    type: 'list',
    name: 'browserTestHarness',
    message: `Your ${chalk.cyan('browser')} ${chalk.green('test harness')}`,
    choices: (props: Config & inquirer.Answers) => {
      switch (props.browserTestFramework) {
        case 'ava':
          return [
            'jsdom'
          ]
        default:
        case 'blue-tape':
          return [
            // tsify not working with TS 1.9 yet
            // { name: 'tape-run + browserify', value: 'tape-run+browserify' },
            { name: 'tape-run + jspm', value: 'tape-run+jspm' },
            'jsdom'
          ]
      }
    },
    default: template.browserTestHarness
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
    default: template.license
  },
  {
    type: 'input',
    name: 'licenseSignature',
    message: `Your signature in the license: Copyright (c) ${new Date().getFullYear()} ${chalk.green('<signature>')}`,
    default: (props: Config) => template.licenseSignature || props.githubUsername
  }]

  return inquirer.prompt(questions) as any
}
