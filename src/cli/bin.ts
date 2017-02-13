#!/usr/bin/env node

import minimist = require('minimist')
import wordwrap = require('wordwrap')
import { join, relative, resolve } from 'path'
import chalk = require('chalk')
import updateNotifier = require('update-notifier')
import extend = require('xtend')
import { EventEmitter } from 'events'

import { PROJECT_NAME } from '../utils/constants'
import { Emitter } from '../utils/emitter'
import { Options } from '../utils/Options'
import { aliases } from './aliases'
import { handle } from './cli'
import { log, logInfo } from './log'

const pkg = require('../package.json')

interface Argv {
  help: boolean
  version: boolean
  verbose: boolean
  cwd?: string
  out?: string
  source?: string
  offset?: number
  limit?: number
  sort?: string
}

interface Args extends Argv, Options {
  _: string[]
}

const argv = minimist<Argv>(process.argv.slice(2), {
  boolean: ['version', 'help'],
  string: ['cwd'],
  alias: {
    help: ['h'],
    version: ['v']
  }
})

const cwd = argv.cwd ? resolve(argv.cwd) : process.cwd()
const emitter: Emitter = new EventEmitter()
const args: Args = extend(argv, { emitter, cwd })

// Notify the user of updates.
updateNotifier({ pkg }).notify()

// Execute with normalizations applied.
exec(args)

emitter.on('notimplemented', (cmd: string) => {
  logInfo(`${cmd} is not yet implemented, PR Welcome.`)
})

/**
 * Handle the CLI commands.
 */
function exec (options: Args): any {
  if (options._.length) {
    const command = aliases[options._[0]]
    const args = options._.slice(1)

    if (command != null) {
      if (options.help) {
        return console.log(command.help())
      }

      return handle(command.exec(args, options), options)
    }
  } else if (options.version) {
    console.log(pkg.version)
    return
  }

  const wrap = wordwrap(4, 80)

  console.log(`
Usage: ${PROJECT_NAME} <command>

Commands:
${wrap(Object.keys(aliases).sort().join(', '))}

${PROJECT_NAME} <command> -h   Get help for <command>
${PROJECT_NAME} <command> -V   Enable verbose logging

Options:
  --version[-v]         Print the CLI version

${PROJECT_NAME}@${pkg.version} ${join(__dirname, '..')}
`)
}
