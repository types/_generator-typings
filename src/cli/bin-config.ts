import { CliBuilder } from 'clibuilder'
import * as config from '../config'

export function configure(program: CliBuilder) {
  program
    .command('config')
    .option('-l, --list', 'list all')
    .option('-u, --update', 'update config with prompts')
    .option('-w, --where', 'show where the config is saved')
    .action((args, options) => {
      if (options.list) {
        program.log(config.list())
      }
      else if (options.where) {
        program.log(config.where())
      }
      else if (options.update) {
        config.update().then(msg => {
          program.log(msg)
        })
      }
      else {
        return false
      }
    })
}
