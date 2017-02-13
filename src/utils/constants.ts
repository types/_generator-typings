const pkg = require('../../package.json')

// alternative suggestions:
// typesrepo, typesgen, create-typings, typings-template
export const PROJECT_NAME = pkg.name
export const PRETTY_PROJECT_NAME = pkg.prettyname
export const CONFIG_FILE = `${PROJECT_NAME}.json`
export const RC_FILE = `${PROJECT_NAME}.rc`
export const CLI_NAME = Object.keys(pkg.bin)[0]
export const CLI_VERSION = pkg.version
