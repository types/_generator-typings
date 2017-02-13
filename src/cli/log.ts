import chalk = require('chalk')

import { PROJECT_NAME, PRETTY_PROJECT_NAME, VERSION } from '../utils/constants'

/**
 * Log a trivial string, without bells or whistles.
 */
export function log(message: string) {
  console.error(message)
}

/**
 * Format a message line.
 */
function formatLine(color: Function, type: string, line: string, prefix?: string) {
  return `${chalk.bgBlack.white(PRETTY_PROJECT_NAME)} ${color(type)} ${prefix ? chalk.magenta(`${prefix} `) : ''}${line}`
}

/**
 * Log an info message.
 */
export function logInfo(message: string, prefix?: string) {
  const output = message.split(/\r?\n/g).map(line => {
    return formatLine(chalk.bgBlack.cyan, 'INFO', line, prefix)
  }).join('\n')

  log(output)
}

/**
 * Log a warning message.
 */
export function logWarning(message: string, prefix?: string) {
  const output = message.split(/\r?\n/g).map(line => {
    return formatLine(chalk.bgYellow.black, 'WARN', line, prefix)
  }).join('\n')

  log(output)
}

/**
 * Log an error message.
 */
export function logError(message: string, prefix?: string) {
  const output = message.split(/\r?\n/g).map(line => {
    return formatLine(chalk.bgBlack.red, 'ERR!', line, prefix)
  }).join('\n')

  log(output)
}
