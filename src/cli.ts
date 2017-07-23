import { Cli } from 'clibuilder'

import { newTypingsProject } from './commands/new-typings-project'
import { CLI_NAME, CLI_VERSION } from './constants'

export const cli = new Cli(CLI_NAME, CLI_VERSION, [newTypingsProject])
