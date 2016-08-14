import { Promise } from 'es6-promise'

import { PROJECT_NAME } from '../utils/constants'
import { setup, SetupOptions } from '../setup'

export function help() {
  return `
${PROJECT_NAME} setup (with no arguments, in cloned repository folder)
${PROJECT_NAME} setup [<organization>/]<repo-name>

Options:
  --bare    Perform minimum setup

Alias:
  gen, generate, scaffold
`
}

export function exec(args: string[], options: SetupOptions): Promise<void> {
  return setup(args[0], options)
}
