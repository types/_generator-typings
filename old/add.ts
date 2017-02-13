import { Promise } from 'es6-promise'

import { Options } from './utils/Options'

export interface AddOptions extends Options {
}

export function add(options: AddOptions) {
  const { emitter } = options
  emitter.emit('notimplemented', 'add')
  return Promise.resolve()
}
