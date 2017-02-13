#!/usr/bin/env node
import { addAppender, setLevel, logLevel } from 'aurelia-logging'
import { ColorAppender } from 'aurelia-logging-color'
import * as fs from 'fs'
import * as minimist from 'minimist'
import * as path from 'path'

import { CLI_NAME, CLI_VERSION } from './utils/constants'

interface Argv {
  loglevel: number,
  silent: boolean
  verbose: boolean
  version: boolean
}

const argv = minimist<Argv>(process.argv.slice(2), {
  boolean: ['version', 'verbose', 'help', 'silent'],
  alias: {
    version: ['v'],
    verbose: ['V'],
    help: ['h']
  },
  unknown: () => true
})

if (argv.version) {
  showVersion()
}

function showVersion() {
  console.info(CLI_VERSION)
  process.exit()
}

addAppender(new ColorAppender())
if (argv.verbose) {
  setLevel(logLevel.debug)
}
else if (argv.silent) {
  setLevel(logLevel.none)
}
else {
  setLevel(logLevel.info)
}

const commandNames = getCommandNames()
const commandMap = createCommandMap(commandNames)
addAliasToMap(commandMap)

const cmd = argv._.shift()

if (!cmd) {
  showHelp()
  process.exit()
}
else {
  executeCommand(cmd)
}

function executeCommand(cmd: string) {
  const command = commandMap[cmd]

  if (!command) {
    showHelp()
    process.exit()
  }

  command.default(process.argv.slice(2))
}

function getHelp() {
  const all = Object.keys(commandMap)
  return `<command>

Commands:
  ${all.join(', ')}

${CLI_NAME} <command> -h      Get help for <command>

Options:
  [-v|--version]          Print the CLI version
  [-V|--verbose]          Turn on verbose logging
  [--silent]              Turn off logging
`
}

function showHelp(help: string = getHelp()) {
  console.info(`
Usage: ${CLI_NAME} ${help}`)
}

function getCommandNames() {
  const files = fs.readdirSync(path.resolve(__dirname, 'commands')).toString().split(',').filter(f => f.endsWith('.js'))
  return files.map(f => f.slice(0, -3))
}

function getCommand(commandName: string) {
  const commandFile = path.resolve(__dirname, 'commands', commandName + '.js')
  return require(commandFile)
}

function createCommandMap(commandNames: string[]) {
  const map = {}
  commandNames.forEach(commandName => {
    const command = getCommand(commandName)
    map[commandName] = command
  })
  return map
}

function addAliasToMap(map) {
  const commandNames = Object.keys(map)
  commandNames.forEach(commandName => {
    const command = map[commandName]
    const alias = command.command.alias || []
    alias.forEach(a => {
      map[a] = command
    })
  })
}
