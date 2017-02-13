import * as wordwrap from 'wordwrap'

const wrap = wordwrap(2, 100)

import { CLI_NAME } from './constants'

import { Command } from './command'

export function showUsage(command: Command) {
  let usage = `Usage: ${CLI_NAME} ${command.name}`
  if (command.arguments) {
    usage += ' ' + command.arguments.map(a => a.required ? a.name : `[${a.name}]`)
  }
  if (command.options) {
    usage += ' <options>'
  }
  usage += `

  ${command.description}
`

  if (command.options) {
    const options = {
      ...command.options.boolean,
      ...command.options.string
    };

    const optionTable = {}
    let keys = Object.keys(options)
    let maxKeyLength = 0
    keys.forEach(k => {
      if (!command.options) {
        return
      }

      let a = command.options.alias && command.options.alias[k] || [];
      (a = a.map(x => '-' + x)).push('--' + k)

      let value = options[k]
      if (!(typeof value === 'string')) {
        value = value.join(', ')
      }

      let d = command.options.default && command.options.default[k]
      if (d) {
        value += ` (default: ${d})`
      }

      const key = `[${a.join('|')}]`
      maxKeyLength = Math.max(maxKeyLength, key.length)
      optionTable[key] = value
    })

    keys = Object.keys(optionTable)
    const padLength = maxKeyLength + 2
    const optionStrs = keys.map(k => {
      return wrap((k + '                      ').slice(0, padLength) + optionTable[k])
    })
    usage += `
Options:
${optionStrs.join('\n')}`
    console.info(usage)
  }
}
