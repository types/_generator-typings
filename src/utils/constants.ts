import pascalCase = require('pascal-case')
const pkg = require('../../package.json')

// alternative suggestions:
// typesgen, create-typings, typings-template
export const PROJECT_NAME = pkg.name
export const PRETTY_PROJECT_NAME = pkg.prettyname
export const CONFIG_FILE = `${PROJECT_NAME}.json`
export const RC_FILE = `${PROJECT_NAME}.rc`
export const VERSION = pkg.version
