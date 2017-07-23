// Scaffold new project
import { CommandSpec } from 'clibuilder'

export const newTypingsProject = {
  name: 'new-typings-project',
  alias: ['new'],
  description: 'Generates a new typings project',
  arguments: [{
    name: 'typings-project-name',
    description: 'Name of the typings'
  }],
  options: {
    boolean: {
      'show-default': {
        description: 'List default values'
      },
      prompt: {
        description: 'Prompt for each value',
        alias: ['p']
      }
    }
  },
  run(args, argv) {
  }
} as CommandSpec
