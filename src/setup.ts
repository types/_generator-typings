import { Promise } from 'es6-promise'

import { Options } from './utils/Options'

export interface SetupOptions extends Options {
}

export function setup(target: string, options: SetupOptions) {
  const { emitter } = options
  emitter.emit('notimplemented', 'setup')
  return Promise.resolve()
}
