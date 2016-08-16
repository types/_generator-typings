import { Promise } from 'es6-promise'
import * as os from 'os'

import { PROJECT_NAME, VERSION } from '../utils/constants'
import { log, logError, logInfo } from './log'

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
  logInfo(VERSION, `${PROJECT_NAME} -v`)

  if ((error as any).code) {
    logError((error as any).code, 'code')
  }

  log('')
  logInfo('If you need help, you may report this error at:')
  logInfo(`  <https://github.com/typings/${PROJECT_NAME}/issues>`)
  log('')
  logInfo('Copy the message above into the issue would be of great help.')

  process.exit(1)
}
