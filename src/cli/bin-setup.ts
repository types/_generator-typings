import { CliBuilder } from 'clibuilder'
// import * as setup from '../setup'

export function configure(program: CliBuilder) {
  program
    .command('setup')
    .alias('gen')
    .alias('generate')
    .alias('scaffold')
    .description('Setup typings repository.\nIf [repository] is not specified, I would assume the current folder is the repository folder.')
    .argument('[repository]', 'Name of the typings repository on GitHub')
    .option('-m, --mode <mode>', 'Override setup mode to use.', {
      'no-prompt': 'Skip prompt',
      'no-test': 'Do not install test',
      'with-test': 'Setup with test'
    })
}
