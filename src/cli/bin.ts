#!/usr/bin/env node

import program from 'clibuilder'

import * as add from './bin-add'
import * as config from './bin-config'
import * as setup from './bin-setup'

const pkg = require('../../package.json')
program.version = pkg.version
program.helpSectionBuilder.noAction = function() {
  return `The command "${this.commandName}" is not implemented yet. PRs are welcome!`
}
add.configure(program)
config.configure(program)
setup.configure(program)

program.start(process.argv)

// program
//   .version(pkg.version)
//   .option('-x', 'asdf')

// program.parse(process.argv)

// interface Argv {
//   help: boolean
//   version: boolean
//   verbose: boolean
//   cwd?: string
//   out?: string
//   source?: string
//   offset?: number
//   limit?: number
//   sort?: string
// }

// interface Args extends Argv, Options {
//   _: string[]
// }

// const argv = minimist<Argv>(process.argv.slice(2), {
//   boolean: ['version', 'help', 'update', 'where'],
//   string: ['cwd'],
//   alias: {
//     help: ['h'],
//     version: ['v'],
//     where: ['w'],
//     update: ['u']
//   }
// })

// const cwd = argv.cwd ? resolve(argv.cwd) : process.cwd()
// const emitter: Emitter = new EventEmitter()
// const args: Args = extend(argv, { emitter, cwd })

// // Notify the user of updates.
// updateNotifier({ pkg }).notify()

// emitter.on('notimplemented', (cmd: string) => {
//   logInfo(`Command ${chalk.yellow(cmd)} is not yet implemented, welcome to contribute.`)
// })

// emitter.on('out', (msg: string) => {

// })

// // Execute with normalizations applied.
// exec(args)

// /**
//  * Handle the CLI commands.
//  */
// function exec(options: Args): any {
//   if (options._.length) {
//     const command = aliases[options._[0]]
//     const args = options._.slice(1)

//     if (command != null) {
//       if (options.help) {
//         return console.log(command.help())
//       }

//       return handle(command.exec(args, options), options)
//     }
//   }
//   else if (options.version) {
//     console.log(pkg.version)
//     return
//   }

//   const wrap = wordwrap(4, 80)

//   console.log(`
// Usage: ${PROJECT_NAME} <command>

// Commands:
// ${wrap(Object.keys(aliases).sort().join(', '))}

// ${PROJECT_NAME} <command> -h   Get help for <command>
// ${PROJECT_NAME} <command> -V   Enable verbose logging

// Options:
//   --version[-v]         Print the CLI version

// ${PROJECT_NAME}@${pkg.version} ${join(__dirname, '../..')}
// `)
// }
