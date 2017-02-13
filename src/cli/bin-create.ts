import { Promise } from 'es6-promise'

import { PROJECT_NAME } from '../utils/constants'
import { create, CreateOptions } from '../create'

export function help() {
  return `
${PROJECT_NAME} create [<organization>/]<repo-name>

Creates github repository.
`
}


export function exec(args: string[], options: CreateOptions): Promise<void> {
  return create(args[0], options)
}
