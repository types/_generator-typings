import { Emitter } from './emitter'

export interface Options {
  emitter: Emitter
}

export function optionsToChoices(options) {
  const result: any[] = []
  for (const key in options) {
    result.push({
      name: options[key] || key,
      value: key
    })
  }
  return result
}
