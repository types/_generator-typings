import { CliBuilder } from 'clibuilder'

export function configure(program: CliBuilder) {
  program.command('integrate')
    .alias('int')
    .description('Creates an integration PR to the source repository.')
}
// TODO: Where/how to put in '(with no arguments, in package dir)'?
