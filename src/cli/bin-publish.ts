import { CliBuilder } from 'clibuilder'

export function configure(program: CliBuilder) {
  program.command('publish')
    .alias('pub')
    .description('Publish changes to typings/registry')
}
