import { CliBuilder } from 'clibuilder'

import { formatLines } from './log'
import { Options } from '../utils/Options'
import { read, where, update } from '../config'

export interface ConfigOptions extends Options {
  list?: boolean
  update?: boolean
  where?: boolean
}

export interface ConfigKeyOptions extends Options {
  options: boolean
}

export function configure(program: CliBuilder) {
  program
    .command('config')
    .option('-l, --list', 'list all')
    .option('-u, --update', 'update config with prompts')
    .option('-w, --where', 'show where the config is saved')
    .action<void, ConfigOptions>((args, options) => {
      if (options.list) {
        // dispatch('config.read')
        program.log(formatLines(read(), 'version'))
      }
      else if (options.where) {
        program.log(where() || 'no config found')
      }
      else if (options.update) {
        update(program)
      }
      else {
        return false
      }
    })
}
