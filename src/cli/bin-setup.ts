import { CliBuilder } from 'clibuilder'
import inquirer = require('inquirer')
import chalk = require('chalk')

import * as config from '../config'
import extend = require('xtend')

import { PackageInfo } from '../sources/interfaces'
import * as npm from '../sources/npm'
import * as bower from '../sources/bower'
import { SetupOptions } from '../setup'

export function configure(program: CliBuilder) {
  program
    .command('setup')
    .alias('gen')
    .alias('generate')
    .alias('scaffold')
    .description('Setup typings repository.\nIf [repository] is not specified, I would assume the current folder is the repository folder.')
    .argument('[repository]', 'Name of the typings repository on GitHub')
    .option('-m, --mode <mode>', 'Override setup mode to use.', {
      'no-prompt': 'Skip prompt',
      'no-test': 'Do not install test',
      'with-test': 'Setup with test'
    })
    .action<{ repository: string },
    SetupOptions>((args, options, builder, program) => {
      let conf = config.read()
      conf = extend(conf, options)
      promptPackageInfo(conf)
        .then(packageInfo => {
          const manager = packageInfo.type === 'npm' ? npm : packageInfo.type === 'bower' ? bower : undefined
          if (manager) {
            return manager.read(packageInfo.name)
              .then(info => {
                return extend(packageInfo, info)
              })
              .catch(() => {
                program.error(`${chalk.red('Oops')}, could not find ${chalk.cyan(packageInfo.name)}.`)
              })
          }
          else {
            return Promise.resolve(packageInfo)
          }
        })
    })
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
    },
    {
      type: 'input',
      name: 'url',
      message: `What is the ${chalk.green('url')} of the package?`,
      validate: (value) => value.length > 0,
      when: (props) => props.type === 'http'
    },
    {
      type: 'input',
      name: 'version',
      message: `What is the ${chalk.green('version')} of the package?`,
      validate: (value) => value.length > 0,
      when: (props) => ['http', 'none'].indexOf(props.type) !== -1
    },
    {
      type: 'input',
      name: 'homepage',
      message: `Enter the ${chalk.green('homepage')} of the package (if any)`,
      when: (props) => props.type === 'http'
    }
  ]

  return inquirer.prompt(questions) as any
}
