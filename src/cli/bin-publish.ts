import { Promise } from 'es6-promise'

import { PROJECT_NAME } from '../utils/constants'
import { publish, PublishOptions } from '../publish'

export function help() {
  return `
${PROJECT_NAME} publish (with no args, in package dir)

`
}

export function exec(args: string[], options: PublishOptions): Promise<void> {
  return publish(options)
}
