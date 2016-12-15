/**
 * Configure default setting.
 * Similar to `git config`
 */
import { CliBuilder } from 'clibuilder'

import { Store } from '../utils/store'
import { CliState } from './cli'
import { formatLines } from './log'
import { Options } from '../utils/Options'
import { read, where, update } from '../components/config'

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
    .option('-p, --prompt', 'update config with prompts')
    .option('-w, --where', 'show where the config is saved')
    .action<void, ConfigOptions>((args, options, builder, ui) => {
      if (options.list) {
        ui.log(formatLines(read(), 'version'))
      }
      else if (options.where) {
        ui.log(where() || 'no config found')
      }
      else if (options.update) {
        update(ui)
      }
      else {
        ui.log(builder.help())
      }
    })
    .command('init')
    .description('Initialize config')
    .action<void, void>((args, options, builder, ui) => {
      update(ui)
    })
}
