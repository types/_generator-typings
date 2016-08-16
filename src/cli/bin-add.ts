import { CliBuilder } from 'clibuilder'

export function configure(program: CliBuilder) {
  program.command('add')
    .argument('<features...>', 'Features to be added to the repository', {
      source: 'add source repository as submodule',
      travis: 'add travis-ci support',
      appveyor: 'add appveyor support'
    })
}
