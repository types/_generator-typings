import { getLogger, Logger } from 'aurelia-logging'
import { paramCase } from 'change-case'
import { execSync } from 'child_process'
import deepExtend = require('deep-extend')
import { mkdirSync, existsSync } from 'fs'
import * as memfs from 'mem-fs'
import * as editor from 'mem-fs-editor'
import { basename, resolve } from 'path'

import { Command, parseCommand, ParsedArgs } from '../utils/command'
import { showUsage } from '../utils/help'

export interface GeneratorStatic<Context extends GeneratorContext> {
  commandOptions
  new (
    log: Logger,
    fs: editor.Editor,
    store: memfs.Store,
    context: Context,
    argv: ParsedArgs
  ): Generator<Context>
}


export abstract class Generator<Context extends GeneratorContext> {
  static commandOptions
  constructor(
    protected log: Logger,
    protected fs: editor.Editor,
    protected store: memfs.Store,
    protected context: Context,
    protected argv: ParsedArgs
  ) { }
  abstract initializing()
  abstract prompting()
  abstract writing()
  abstract install()
}

export class Runner {
  generators: Generator<any>[] = []
  context: GeneratorContext
  argv: ParsedArgs
  fs: editor.Editor
  log: Logger
  store: memfs.Store
  constructor(public command: Command, public rawArgv: string[], ...generators: GeneratorStatic<any>[]) {
    generators.forEach(g => {
      command.options = deepExtend(command.options, g.commandOptions)
    })

    this.argv = parseCommand(rawArgv, command)
    // First entry is command name. Not used.
    this.argv._.shift()

    if (this.argv.help) {
      // not good practice
      showUsage(command)
      process.exit()
    }

    this.log = getLogger('generate-project')
    this.store = memfs.create()
    this.fs = editor.create(this.store)

    this.context = {
      projectName: this.argv._.shift()
    } as GeneratorContext

    this.log.debug(`projectName: ${this.context.projectName}`)

    this.context.authorName = execSync('git config user.name').toString().trim()
    this.context.authorEmail = execSync('git config user.email').toString().trim()
    this.context.authorUsername = execSync('git config user.username').toString().trim()

    this.log.debug(`authorName: ${this.context.authorName}`)
    this.log.debug(`authorEmail: ${this.context.authorEmail}`)
    this.log.debug(`authorUsername: ${this.context.authorUsername}`)

    const cwd = process.cwd()

    if (this.context.projectName) {
      this.context.organization = basename(cwd)
      this.context.projectFolder = paramCase(this.context.projectName)
      if (!existsSync(this.context.projectName)) {
        mkdirSync(this.context.projectName)
      }
    }
    else {
      this.context.projectName = basename(cwd)
      this.context.organization = basename(resolve('..'))
      this.context.projectFolder = '.'
    }
    this.log.debug(`organization: ${this.context.organization}`)
    this.log.debug(`projectFolder: ${this.context.projectFolder}`)

    generators.forEach(g => {
      this.generators.push(new g(this.log, this.fs, this.store, this.context, this.argv))
    })
  }

  run() {
    this.generators.forEach(g => g.initializing())

    for (let p in this.context) {
      if (['log', 'store', 'fs'].indexOf(p) === -1) {
        this.log.debug(`${p}: ${this.context[p]}`)
      }
    }

    this.generators.forEach(g => g.prompting())
    this.generators.forEach(g => g.writing())

    // write files
    this.fs.commit(() => {
      this.log.debug('All files written')

      // Change dir to projectFolder so npm/yarn will install in the correct folder.
      process.chdir(this.context.projectFolder)
      this.generators.forEach(g => g.install())
    })
  }

  showUsage() {
    showUsage(this.command)
  }
}

export interface GeneratorContext {
  authorName: string
  authorEmail: string
  authorUsername: string
  projectName: string
  projectFolder: string
  organization: string
}
