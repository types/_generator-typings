import { CliBuilder } from 'clibuilder'
import inquirer = require('inquirer')
import chalk = require('chalk')

import { Config } from '../config'
// import extend = require('xtend')

import { PackageInfo, SetupOptions } from '../setup'

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
    SetupOptions>((args, options) => {
      // let conf = config.read()
      // conf = extend(conf, options)
      // const packageInfo = setup.promptPackageInfo(conf)

      // if (mode === 'no-prompt') {
      //   return false
      // }
      // else {
      // }

      // if (mode === 'no-test') {

      // }
      // if (mode === 'with-test') {

      // }
      //     reject(`${chalk.red('Oops')}, could not find ${chalk.cyan(result.sourceDeliveryPackageName)}.`);
    })
}

export function promptPackageInfo(config: Config): Promise<PackageInfo> {
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
      name: 'packageName',
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
      name: 'packageUrl',
      message: `What is the ${chalk.green('url')} of the package?`,
      validate: (value) => value.length > 0,
      when: (props) => props.type === 'http'
    }
  ]

  return inquirer.prompt(questions) as any
}
