import rc = require('rc')
import chalk = require('chalk')

import { PROJECT_NAME } from './utils/constants'
import { Config } from './config'

export interface OldConfig {
  username: string,
  repositoryNamePrefix: string,
  repositoryOrganization: string,
  testFramework: 'blue-tape',
  browserTestHarness: 'tape-run+jspm',
  license: 'Apache-2.0' | 'MIT' | 'unlicense' | 'BSD-2-Clause-FreeBSD' | 'BSD-3-Clause' | 'ISC' | 'nolicense',
  licenseSignature: string
}

export function createDefaultTemplate(): Config {
  // const { username } = loadGitConfig()
  const username = ''
  return {
    githubUsername: username,
    githubOrganization: username,
    license: 'MIT',
    licenseSignature: username,
    mode: 'with-test',
    features: ['source', 'travis']
  }
}

export function readConfig(): Config {
  return rc(PROJECT_NAME) as Config
}

export function readOldConfig(): OldConfig {
  return rc('generator-typings') as OldConfig
}

export function convertOldConfig(oldConfig: OldConfig): Config & { config: string } {
  return {
    githubUsername: oldConfig.username,
    githubOrganization: oldConfig.repositoryOrganization,
    license: oldConfig.license,
    licenseSignature: oldConfig.licenseSignature,
    mode: 'with-test',
    features: [],
    serverTestFramework: oldConfig.testFramework,
    browserTestFramework: oldConfig.testFramework,
    browserTestHarness: oldConfig.browserTestHarness,
    config: (oldConfig as any).config
  }
}

export function getPrintMessage(config: Config) {
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
