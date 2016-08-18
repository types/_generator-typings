import { CliBuilder } from 'clibuilder'
import inquirer = require('inquirer')
import chalk = require('chalk')
import extend = require('xtend')
import Promise = require('any-promise')
import path = require('path')

import * as config from '../config'
import { update as updateConfig } from './bin-config'
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
    .action<{ repository: string },
    setup.SetupOptions>((args, options, builder, program) => {
      const cwd = args.repository ? path.resolve(process.cwd(), args.repository) : process.cwd()
      const setupInfo: setup.SetupInfo = {}
      const git = new Git(cwd)
      const gettingRepoInfo = git.getRepositoryInfo()
      const conf = config.read()
      let configReady = Promise.resolve(conf)
      if (config.isDefault(conf)) {
        program.log(`Seems like this is the ${chalk.cyan('first time')} you use this generator.`)
        program.log(`Let's quickly setup the ${chalk.green('config template')}...`)
        configReady = updateConfig(program)
      }
      else if (config.needsUpdate(conf)) {
        program.log(`Seems like you have ${chalk.cyan('updated')} this generator. The config template has changed.`)
        program.log(`Let's quickly update the ${chalk.green('config template')}...`)
        configReady = updateConfig(program)
      }

      Promise.all([configReady, gettingRepoInfo])
        .then(values => {
          setupInfo.config = extend(values[0], options)
          setupInfo.repositoryInfo = values[1]

          program.log('')
          program.log(`I'll be creating the ${chalk.yellow('typings')} repository under the ${chalk.cyan(args.repository ? args.repository : 'current')} folder`)
          program.log('')
          program.log(`To begin, I need to know a little bit about the ${chalk.green('source')} you are typings for.`)
          return promptPackageInfo(values[0])
        })
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
          setupInfo.packageInfo = packageInfo
          return promptUsageInfo()
        })
        .then(usageInfo => {
          setupInfo.usageInfo = usageInfo

          program.log('')
          program.log(`Good, now about the ${chalk.yellow('typings')} itself...`)
        })
        .then(() => {
          console.log(setupInfo)
        })
    })
}

export function promptUsageInfo(): Promise<setup.UsageInfo> {
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

export function promptPackageInfo(config: config.Config): Promise<PackageInfo> {
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
  return inquirer.prompt(questions) as any
}
