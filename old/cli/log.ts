import chalk = require('chalk')

import { PRETTY_PROJECT_NAME } from '../utils/constants'

export function log(message: string) {
  console.log(message)
}

/**
 * Log a trivial string, without bells or whistles.
 */
export function error(message: string) {
  console.error(message)
}

/**
 * Format a message line.
 */
function formatLine(color: Function, type: string, line: string, prefix?: string) {
  return `${chalk.bgBlack.white(PRETTY_PROJECT_NAME)} ${color(type)} ${prefix ? chalk.magenta(`${prefix} `) : ''}${line}`
}

export function formatLines(map: Object, ...keysToSkip: string[]) {
  const result: string[] = []
  for (const key in map) {
    if (keysToSkip.indexOf(key) !== -1) {
      continue
    }

    result.push(`${chalk.cyan(key)} = ${chalk.green(map[key])}`)
  }
  return result.join('\n')
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

  error(output)
}
