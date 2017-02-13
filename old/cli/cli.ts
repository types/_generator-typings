import { CliBuilder } from 'clibuilder'

import { Promise } from 'es6-promise'
import * as os from 'os'

import { Store } from '../utils/store'
import { CLI_NAME, VERSION } from '../utils/constants'
import { log, logError, logInfo } from './log'
import { isIssueCommandAction, createIssueCommandAction } from './cli.actions'

export interface CliState<Arg, Option > {
  commandChain: string
  args: Arg
  options: Option
}

export function configure(program: CliBuilder, store: Store) {
  store.addReducer('cli', (state, action) => {
    if (action.type === '@@redux/INIT') {
      return {}
    }
    else if (isIssueCommandAction(action)) {
      return action.payload
    }
    return state
  })

  program.defaultAction = (args, options, builder, ui) => {
    store.dispatch(createIssueCommandAction(builder.getCommandChain(), args, options))
  }
}

/**
 * Options for the execution.
 */
export interface PrintOptions {
  verbose: boolean
}

/**
 * Handle a CLI function handler.
 */
export function handle(promise: any, options: PrintOptions) {
  return Promise.resolve(promise).catch(err => handleError(err, options))
}

/**
 * Final error handling for the CLI.
 */
export function handleError(error: Error, options: PrintOptions): any {
  let cause = (error as any).cause

  logError(error.message, 'message')

  while (cause) {
    logError(cause.message, 'caused by')

    cause = (cause as any).cause
  }

  if (options.verbose && error.stack) {
    log('')
    logError(error.stack, 'stack')
  }

  log('')
  logInfo(process.cwd(), 'cwd')
  logInfo(`${os.type()} ${os.release()}`, 'system')
  logInfo(process.argv.map(v => JSON.stringify(v)).join(' '), 'command')
  logInfo(process.version, 'node -v')
  logInfo(VERSION, `${CLI_NAME} -v`)

  if ((error as any).code) {
    logError((error as any).code, 'code')
  }

  log('')
  logInfo('If you need help, you may report this error at:')
  logInfo(`  <https://github.com/typings/${CLI_NAME}/issues>`)
  log('')
  logInfo('Copy the message above into the issue would be of great help.')

  process.exit(1)
}
