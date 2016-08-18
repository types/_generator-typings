import { join } from 'path'
import { homedir } from 'os'
import { writeFile } from 'fs'

import { Options } from './utils/Options'
import { PROJECT_NAME } from './utils/constants'
import { readRaw } from './config.utils'

const CONFIGVERSION = 2
export const GLOBAL_OLD_CONFIG_PATH = join(homedir(), `.generator-typingsrc`)
export const GLOBAL_CONFIG_PATH = join(homedir(), `.${PROJECT_NAME}rc`)

export const Features = {
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

export interface Config {
  githubUsername: string,
  githubOrganization: string,
  license: 'Apache-2.0' | 'MIT' | 'unlicense' | 'BSD-2-Clause-FreeBSD' | 'BSD-3-Clause' | 'ISC' | 'nolicense',
  licenseSignature: string,
  lint?: boolean
  serverTest?: 'blue-tape' | 'ava'
  browserTest?: 'blue-tape' | 'ava'
  browserTestHarness?: 'tape-run+jspm' | 'jsdom'
  githubRepositoryCreation?: boolean
  sourceSubmodule?: boolean
  travis?: boolean
  appveyor?: boolean
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
