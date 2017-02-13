// Scaffold new project

import { PlainProject } from '../generators/PlainProject'
// import { BasicProjectGenerator } from '../generators/basic'
// import { TestGenerator } from '../generators/test'

import { Command } from '../utils/command'
import { Runner } from '../utils/Generator'

export default function generateProject(rawArgv: string[]) {
  const runner = new Runner(command, rawArgv, PlainProject)

  runner.run()
}

export const command: Command = {
  name: 'generate-typings-project',
  description: 'Generates a new typings project',
  alias: ['gentypings', 'newtypings'],
  arguments: [{
    name: 'typings-project-name'
  }],
  options: {
    boolean: {
      'show-default': 'List default values',
      prompt: 'Prompt for each value',
      help: 'Show help',
      verbose: 'Turn on verbose logging'
    },
    alias: {
      prompt: ['p'],
      help: ['h'],
      verbose: ['V']
    }
  }
}
