import { CliBuilder } from 'clibuilder'

export function configure(program: CliBuilder) {
  program.command('create')
    .description('Creates github repsitory.')
    .argument('<repository name>', 'name of the repository')
}
