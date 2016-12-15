import chalk = require('chalk')
import inquirer = require('inquirer')
import { UI } from 'clibuilder'
import extend = require('xtend')
import Promise = require('any-promise')

import { read, save, CONFIGVERSION, Config, questions, isDefault, needsUpdate } from './config.logic'
export { read, where, questions, Config } from './config.logic'

export function update(ui: UI) {
  let config = read()
  return prompt(config)
    .then(config => {
      config.version = CONFIGVERSION
      config = save(config)
      ui.log('config updated.')
      return config
    })
}

export function prompt(config: Config): Promise<Config> {
  const keys = Object.keys(questions)
  return inquirer.prompt(keys.map(key => extend(questions[key], { default: config[key] }))) as any
}

export function checkAndUpdate(ui: UI): Promise<Config> {
  const conf = read()
  let configReady = Promise.resolve(conf)
  if (isDefault(conf)) {
    ui.log(`Seems like this is the ${chalk.cyan('first time')} you use this generator.`)
    ui.log(`Let's quickly setup the ${chalk.green('config template')}...`)
    configReady = update(ui)
  }
  else if (needsUpdate(conf)) {
    ui.log(`Seems like you have ${chalk.cyan('updated')} this generator. The config template has changed.`)
    ui.log(`Let's quickly update the ${chalk.green('config template')}...`)
    configReady = update(ui)
  }

  return configReady
}
