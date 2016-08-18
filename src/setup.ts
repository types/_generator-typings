import { Options } from './utils/Options'

import { Config } from './config'
import { RepositoryInfo } from './git'
import { PackageInfo } from './sources/interfaces'

export interface SetupOptions extends Options {
}

export interface UsageInfo {
  usages: string[]
  platforms: string[]
}

export interface SetupInfo {
  config: Config
  repositoryInfo: RepositoryInfo
  packageInfo: PackageInfo
  usageInfo?: UsageInfo
}
