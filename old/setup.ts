import extend = require('xtend')

import { Config } from './components/config'
import { RepositoryInfo } from './git'
import { PackageInfo } from './sources/interfaces'

export interface SetupInfo {
  githubUsername: string
  repositoryName: string
  repositoryOrganization: string
  repositoryPath: string
  repositoryUrl: string
  license: string
  licenseSignature: string
  lint?: boolean
  serverTest?: string
  browserTest?: string
  browserTestHarness?: string
  githubRepositoryCreation?: boolean
  sourceSubmodule?: boolean
  travis?: boolean
  appveyor?: boolean
  usages?: string[]
  platforms: string[]
}

/**
 * Information on specific set of typings: module, global, umd, etc.
 */
export interface TypingsInfo {
  global: boolean
  /**
   * Can the source used on server side
   */
  server: boolean
  /**
   * Can the source used on browser side
   */
  browser: boolean
}

export interface SetupState {
  config: Config
  repository: RepositoryInfo
  source: PackageInfo
  setup: SetupInfo
}

export function buildSetupInfo(state: SetupState): SetupInfo {
  const { config, repository, setup} = state
  return extend({
    githubUsername: config.githubUsername,
    repositoryName: repository.name,
    repositoryOrganization: repository.organization,
    repositoryPath: repository.path,
    repositoryUrl: repository.remoteUrl,
    license: config.license,
    licenseSignature: config.licenseSignature,
    lint: config.lint,
    serverTest: config.serverTest,
    browserTest: config.browserTest,
    browserTestHarness: config.browserTestHarness,
    githubRepositoryCreation: config.githubRepositoryCreation,
    sourceSubmodule: config.sourceSubmodule,
    travis: config.travis,
    appveyor: config.appveyor
  }, setup)
}
