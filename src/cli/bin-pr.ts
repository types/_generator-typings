
import { Promise } from 'es6-promise'

import { PROJECT_NAME } from '../utils/constants'
import { pr, PROptions } from '../pr'

export function help() {
  return `
${PROJECT_NAME} pr (with no arguments, in package dir)

Creates a integration PR to the source repository.

Alias:
  integrate
`
}

export interface CliPROptions extends PROptions {
  cwd: string
}

export function exec(args: string[], options: CliPROptions): Promise<void> {
  return pr(options)
}
