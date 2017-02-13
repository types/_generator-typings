import { Promise } from 'es6-promise'

import { Options } from './utils/Options'

export interface CreateOptions extends Options {
}

export function create(target: string, options: CreateOptions) {
  const { emitter } = options
  emitter.emit('notimplemented', 'create')
  return Promise.resolve()
}
