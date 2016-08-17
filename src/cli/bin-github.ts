import { CliBuilder } from 'clibuilder'

export function configure(program: CliBuilder) {
  const githubCmd = program.command('github')

  githubCmd.command('create')
    .description('Creates github repsitory.')
    .argument('<repository name>', 'name of the repository')

  githubCmd.command('integrate')
    .alias('int')
    .description('Creates an integration PR to the source repository.')
// TODO: Where/how to put in '(with no arguments, in package dir)'?

  const typingsCmd = githubCmd.command('typings')
  typingsCmd.command('publish')
    .alias('pub')
    .description('Publish changes to typings/registry')
// TODO: Where/how to put in '(with no arguments, in package dir)'?
}
