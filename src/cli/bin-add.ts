import { Promise } from 'es6-promise'

import { PROJECT_NAME } from '../utils/constants'
import { add, AddOptions } from '../add'

export function help() {
  return `
${PROJECT_NAME} add [...<feature>]

  <feature> Features to be added to the repository.

Features:
  test          Add test template to the repository.
  source        Clone the source package to the repository.
  source+test   Add test template based on source package.

`
}

export interface CliAddOptions extends AddOptions {
  cwd: string
}

export function exec(args: string[], options: CliAddOptions): Promise<void> {
  return add(options)
}
