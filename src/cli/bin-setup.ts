import { CliBuilder } from 'clibuilder'
import inquirer = require('inquirer')
import chalk = require('chalk')
import extend = require('xtend')
import Promise = require('any-promise')
import path = require('path')

import { Options } from '../utils/Options'
// import { fs } from '../utils/fs'
import { questions, checkAndUpdate } from '../config'
import { formatLines } from './log'
import { Git } from '../git'

import { PackageInfo } from '../sources/interfaces'
import * as npm from '../sources/npm'
import * as bower from '../sources/bower'
import * as setup from '../setup'

export function configure(program: CliBuilder) {
  program
    .command('setup')
    .alias('gen')
    .alias('generate')
    .alias('scaffold')
    .description('Setup typings repository.\nIf [repository] is not specified, I would assume the current folder is the repository folder.')
    .argument('[repository]', 'Name of the typings repository on GitHub')
    .action<SetupArguments, SetupOptions>((args, options, builder, program) => {
      let state: setup.SetupState = {} as any
      let git: Git
      checkAndUpdate(program)
        .then(conf => {
          state.config = extend(conf, options)
          const cwd = args.repository ? path.resolve(process.cwd(), conf.repositoryNamePrefix + args.repository) : process.cwd()
          git = new Git(cwd)
          return git.getRepositoryInfo()
        })
        .then(repoInfo => {
          state.repository = repoInfo
          return prompt(state, program)
        })
        .then(st => {
          state = st
          if (!state.repository.exists && state.setup.githubRepositoryCreation) {
            return git.clone(state.repository.remoteUrl)
          }
        })
        .then(() => {
          if (options.skipWrite) {
            return
          }
        })
        .then(() => {
          console.log(state)
        }, (err) => {
          program.error(err)
        })
    })
}

export interface SetupArguments {
  repository: string
}

export interface SetupOptions extends Options {
  skipGit: boolean
  skipWrite: boolean
}

// function write(state: setup.SetupState) {

// }

function prompt(setupState: setup.SetupState, program: CliBuilder): Promise<setup.SetupState> {
  console.log(setupState)
  const { repository } = setupState
  program.log('')
  program.log(`I'll be creating the ${chalk.cyan(repository.name)} ${chalk.yellow('typings')} repository at ${chalk.green(repository.path)}`)
  program.log('')
  program.log(`To begin, I need to know a little bit about the ${chalk.cyan('source')} you are typings for.`)

  return promptPackageInfo(setupState)
    .then(packageInfo => {
      const manager = packageInfo.type === 'npm' ? npm : packageInfo.type === 'bower' ? bower : undefined
      if (manager) {
        program.log(`gathering info from ${chalk.cyan(packageInfo.type)}...`)
        return manager.read(packageInfo.name)
          .then(info => {
            return extend(packageInfo, info)
          }, () => {
            program.error(`${chalk.red('Oops')}, could not find ${chalk.cyan(packageInfo.name)}.`)
          })
      }
      else {
        return Promise.resolve(packageInfo)
      }
    })
    .then(packageInfo => {
      return promptMissingPackageInfo(packageInfo, program)
    })
    .then(packageInfo => {
      setupState.source = packageInfo
      return promptUsageInfo()
    })
    .then(usageInfo => {
      setupState.setup = usageInfo

      program.log('')
      program.log(`Good, now about the ${chalk.yellow('typings')} itself...`)
      program.log('Based on your configured template, I will be creating the repository with these information...')
      setupState.setup = setup.buildSetupInfo(setupState)
      program.log(formatSetupSummary(setupState))

      return inquirer.prompt({
        type: 'confirm',
        name: 'yes',
        message: 'Does it look good to you?',
        default: true
      }).then((props: any) => {
        if (!props.yes) {
          return promptCustomize(setupState)
            .then(state => {
              setupState = state
            })
        }
      })
    })
    .then(() => {
      return setupState
    })
}
function formatSetupSummary(state: setup.SetupState) {
  const { setup } = state
  let summary = {
    githubUsername: state.config.githubUsername,
    repositoryName: setup.repositoryName,
    repositoryOrganization: setup.repositoryOrganization,
    repositoryPath: setup.repositoryPath,
    repositoryUrl: setup.repositoryUrl,
    license: setup.license,
    licenseSignature: setup.licenseSignature,
    lint: setup.lint,
    sourceSubmodule: setup.sourceSubmodule,
    travis: setup.travis,
    appveyor: setup.appveyor
  } as any

  if (setup.platforms.indexOf('node') !== -1) {
    summary.serverTest = setup.serverTest
  }

  if (setup.platforms.indexOf('browser') !== -1) {
    summary.browserTest = setup.browserTest
    summary.browserTestHarness = setup.browserTestHarness
  }
  return formatLines(summary)
}
export function promptCustomize(state: setup.SetupState): Promise<setup.SetupState> {
  const { config, repository, setup } = state
  return inquirer
    .prompt([
      {
        type: 'input',
        name: 'organization',
        message: `https://github.com/${chalk.green('<organization>')}/...`,
        default: repository.organization,
        validate: (value) => value.length > 0
      },
      {
        type: 'input',
        name: 'name',
        message: (props: any) => `https://github.com/${chalk.cyan(props.organization)}/${chalk.green('<name>')}`,
        default: repository.name,
        validate: (value) => value.length > 0
      }
    ])
    .then((props: any) => {
      setup.repositoryOrganization = props.organization
      setup.repositoryName = props.name
      const keysToIgnore = ['githubOrgnaization', 'repositoryNamePrefix']
      if (setup.platforms.indexOf('node') === -1) {
        keysToIgnore.push('serverKey')
      }
      if (setup.platforms.indexOf('browser') === -1) {
        keysToIgnore.push('browserTest', 'browserTestHarness')
      }
      if (repository.exists) {
        keysToIgnore.push('githubRepositoryCreation')
      }

      const keys = Object.keys(questions).filter(key => keysToIgnore.indexOf(key) === -1)

      return inquirer.prompt(keys.map(key => extend(questions[key], { default: config[key] })))
        .then((props: any) => {
          state.setup = extend(state.setup, props)
        })
    })
    .then(() => {
      return state
    }) as any
}

export function promptUsageInfo(): Promise<setup.SetupInfo> {
  return inquirer.prompt([{
    type: 'checkbox',
    name: 'usages',
    message: `${chalk.green('How')} can the package be used?`,
    choices: [
      { name: 'AMD Module', value: 'amd' },
      { name: 'CommonJS Module', value: 'commonjs', checked: true },
      { name: 'ES2015 Module', value: 'esm' },
      { name: 'Script Tag', value: 'script' },
      { name: 'part of environment', value: 'env' }
    ],
    validate: (values) => values.length > 0
  }, {
    type: 'checkbox',
    name: 'platforms',
    message: `${chalk.green('Where')} can the package be used?`,
    choices: [
      { name: 'Browser', value: 'browser' },
      { name: 'Native NodeJS', value: 'node', checked: true },
      { name: 'others (e.g. atom)', value: 'others' }
    ],
    validate: (values) => values.length > 0,
    default: []
  }]) as any
}

export function promptPackageInfo(info: setup.SetupState): Promise<PackageInfo> {
  const questions = [
    {
      type: 'list',
      name: 'type',
      message: `Where can I get it ${chalk.green('from')}?`,
      choices: [
        { name: 'Bower', value: 'bower' },
        { name: 'CDN or http(s)', value: 'http' },
        // { name: 'Duo', value: 'duo', disabled: 'coming not so soon...' },
        // { name: 'Jam', value: 'jam', disabled: 'coming not so soon...' },
        // { name: 'JSPM', value: 'jspm', disabled: 'coming not so soon...' },
        { name: 'NPM', value: 'npm' },
        // { name: 'volo', value: 'volo', disabled: 'coming not so soon...' },
        { name: 'cannot be downloaded', value: 'none' }
      ],
      default: 'npm'
    },
    {
      type: 'input',
      name: 'name',
      message: (props) => {
        switch (props.type) {
          case 'http':
          case 'none':
            return `What is the ${chalk.green('name')} of the package?`
          default:
            return `${chalk.cyan(props.type)} install ${chalk.green('<package name>')}?`
        }
      },
      default: info.repository.name.indexOf(info.config.repositoryNamePrefix) === 0 ?
        info.repository.name.slice(info.config.repositoryNamePrefix.length) :
        info.repository.name,
      validate: (value) => value.length > 0
    }
  ]

  return inquirer.prompt(questions) as any
}

export function promptMissingPackageInfo(packageInfo: PackageInfo, program: CliBuilder): Promise<PackageInfo> {
  const questions: inquirer.Question[] = []
  if (!packageInfo.gitUrl) {
    questions.push({
      type: 'input',
      name: 'gitUrl',
      message: `${chalk.green('Where')} can I clone the source repository (e.g. git+ssh://github.com/typings/generator-typings.git)?`,
      validate: (value) => value.length > 0
    })
  }
  if (!packageInfo.version) {
    questions.push({
      type: 'input',
      name: 'version',
      message: `What is the ${chalk.green('version')} of the package?`,
      validate: (value) => value.length > 0
    })
  }
  if (!packageInfo.homepage) {
    questions.push({
      type: 'input',
      name: 'homepage',
      message: `Enter the ${chalk.green('homepage')} of the package (if any)`
    })
  }

  if (questions.length) {
    program.log('There are some info missing from the source, so I need to ask a few more questions...')
  }
  return inquirer.prompt(questions)
    .then(answsers => {
      return extend(packageInfo, answsers) as PackageInfo
    })
}
