import { Options } from './utils/Options'

export interface SetupOptions extends Options {
}

export interface PackageInfo {
  /**
   * Delivery type
   */
  type: 'npm' | 'bower' | 'http'
  packageName: string
  packageUrl?: string
}
