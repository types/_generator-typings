import { Promise } from 'es6-promise'

import { Options } from './utils/Options'

export interface PublishOptions extends Options {
}

export function publish(options: PublishOptions) {
  const { emitter } = options
  emitter.emit('notimplemented', 'publish')
  return Promise.resolve()
}
