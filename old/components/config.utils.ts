import rc = require('rc')

import { PROJECT_NAME } from '../utils/constants'
import { Config } from './config.logic'
import { getConfigValue } from '../git'

export interface OldConfig {
  username: string,
  repositoryNamePrefix: string,
  repositoryOrganization: string,
  testFramework: 'blue-tape',
  browserTestHarness: 'tape-run+jspm',
  license: 'Apache-2.0' | 'MIT' | 'unlicense' | 'BSD-2-Clause-FreeBSD' | 'BSD-3-Clause' | 'ISC' | 'nolicense',
  licenseSignature: string
}

export function createDefaultConfig(): Config {
  const username = getConfigValue('user.username')
  return {
    githubUsername: username,
    githubOrganization: username,
    repositoryNamePrefix: '',
    license: 'MIT',
    licenseSignature: username,
    serverTest: 'blue-tape',
    browserTest: 'blue-tape',
    browserTestHarness: 'tape-run+jspm',
    sourceSubmodule: true,
    travis: true
  }
}

/**
 * Read config.
 * This function is not testable as we cannot control where `rc` reads the config file.
 */
export function readConfig(): Config {
  return rc(PROJECT_NAME) as Config
}

/**
 * Read old config.
 * This function is not testable as we cannot control where `rc` reads the config file.
 */
export function readOldConfig(): OldConfig {
  return rc('generator-typings') as OldConfig
}

export function convertOldConfig(oldConfig: OldConfig): Config & { config: string } {
  return {
    githubUsername: oldConfig.username,
    githubOrganization: oldConfig.repositoryOrganization,
    repositoryNamePrefix: oldConfig.repositoryNamePrefix,
    license: oldConfig.license,
    licenseSignature: oldConfig.licenseSignature,
    serverTest: oldConfig.testFramework,
    browserTest: oldConfig.testFramework,
    browserTestHarness: oldConfig.browserTestHarness,
    config: (oldConfig as any).config
  }
}
