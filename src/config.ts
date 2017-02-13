import { Promise } from 'es6-promise'

import { Options } from './utils/Options'

export interface ConfigOptions extends Options {
  list: boolean
  where: boolean
}

export interface ConfigKeyOptions extends Options {
  options: boolean
}

export function config(options: ConfigOptions): Promise<void> {
  return Promise.resolve()
}

export function configKey(key: string, values: string[], options: ConfigKeyOptions): Promise<void> {
  return Promise.resolve()
}
