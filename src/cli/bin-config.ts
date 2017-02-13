import { Promise } from 'es6-promise'

import { PROJECT_NAME } from '../utils/constants'
import { config, configKey, ConfigOptions, ConfigKeyOptions } from '../config'

export function help() {
  return `
${PROJECT_NAME} config (with no arguments) [-l] [-w]
${PROJECT_NAME} config <key> [...<value>] [-o]

  <key>         Config name. "--list" to see all keys

Options:
  --list[-l]     List current config
  --where[-w]    Show where the config is saved
  --options[-o]  List the option of a particular config
`
}

export interface CliOptions extends ConfigOptions, ConfigKeyOptions {
}

export function exec(args: string[], options: CliOptions): Promise<void> {
  if (~args.length) {
    return configKey(args[0], args.slice(1), options)
  }

  return config(options)
}
