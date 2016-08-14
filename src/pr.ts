import { Promise } from 'es6-promise'

import { Options } from './utils/Options'

export interface PROptions extends Options {
}

/**
 * Create a PR to integrate typings directly to the source.
 */
export function pr(options: PROptions) {
  const { emitter } = options
  emitter.emit('notimplemented', 'pr')
  return Promise.resolve()
}
