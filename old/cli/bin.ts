#!/usr/bin/env node

import program from 'clibuilder'

// import * as add from './bin-add'
import * as config from './bin-config'
import * as setup from './bin-setup'

const pkg = require('../../package.json')

program.version = pkg.version
program.helpSectionBuilder.noAction = function () {
  if (!this.builder.hasActionOrCommands()) {
    return `The command "${this.builder.commandName}" is not implemented yet. PRs are welcome!`
  }
}

// add.configure(program, store)
config.configure(program)
setup.configure(program)

program.start(process.argv)
