import * as add from './bin-add'
import * as config from './bin-config'
import * as create from './bin-create'
import * as publish from './bin-publish'
import * as setup from './bin-setup'

export interface Aliases {
  [cmd: string]: {
    exec(args: string[], options: Object): any;
    help(): string;
  }
}

export const aliases: Aliases = {
  // add
  add,
  // config
  config,
  // create
  create,
  // publish
  publish,
  // setup
  setup,
  scaffold: setup
}
