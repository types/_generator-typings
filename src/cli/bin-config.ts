import { CliBuilder } from 'clibuilder'
import chalk = require('chalk')

import * as config from '../config'

export function configure(program: CliBuilder) {
  program
    .command('config')
    .option('-l, --list', 'list all')
    .option('-u, --update', 'update config with prompts')
    .option('-w, --where', 'show where the config is saved')
    .action((args, options) => {
      if (options.list) {
        program.log(getPrintMessage(config.read()))
      }
      else if (options.where) {
        program.log(config.where() || 'no config found')
      }
      else if (options.update) {
        config.update().then(() => {
          program.log('config updated.')
        })
      }
      else {
        return false
      }
    })
}

export function getPrintMessage(config: config.Config) {
  return `
${chalk.cyan('githubUsername')} = ${chalk.green(config.githubUsername)}
${chalk.cyan('githubOrganization')} = ${chalk.green(config.githubOrganization)}
${chalk.cyan('license')} = ${chalk.green(config.license)}
${chalk.cyan('licenseSignature')} = ${chalk.green(config.licenseSignature)}
${chalk.cyan('mode')} = ${chalk.green(config.mode)}
${chalk.cyan('features')} = ${chalk.green('[' + (config.features.join(' | ') as string || 'none') + ']')}
${chalk.cyan('serverTestFramework')} = ${chalk.green(config.serverTestFramework as string)}
${chalk.cyan('browserTestFramework')} = ${chalk.green(config.browserTestFramework as string)}
${chalk.cyan('browserTestHarness')} = ${chalk.green(config.browserTestHarness as string)}
`
}
