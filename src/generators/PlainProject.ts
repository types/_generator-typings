import { paramCase } from 'change-case'
import { execSync } from 'child_process'
import inquirer = require('inquirer')
import chalk = require('chalk')
import { resolve, join } from 'path'

import { GeneratorContext, Generator } from '../utils/Generator'
import { CLI_VERSION } from '../utils/constants'
import { CommandOptions } from '../utils/command'

export interface PlainProjectGeneratorContext extends GeneratorContext {
  licnse: string
  sourceUsages: string[]
}

export class PlainProject extends Generator<PlainProjectGeneratorContext> {
  static commandOptions: CommandOptions = {
    boolean: {
    },
    string: {
      license: ['Apache', 'BSD-2', 'BSD-3', 'ISC', 'MIT', 'UNLICENSED', 'NOLICENSE']
    },
    alias: {
      license: ['lic']
    },
    default: {
      license: 'MIT'
    }
  }
  /**
   * npm package name.
   */
  packageName: string
  packageBundleFilename: string
  license: string

  constructor(log, fs, store, context, argv) {
    super(log, fs, store, context, argv)
  }

  initializing() {
    this.license = this.argv.license
    this.log.debug(`license: ${this.license}`)

    try {
      const repoUrl = execSync(`npm info ${this.context.projectName} repository.url`).toString()
      this.packageName = repoUrl.indexOf(`${this.context.organization}/${this.context.projectName}`) === -1 ?
        `@${this.context.organization}/${this.context.projectName}` : this.context.projectName
    }
    catch (e) {
      this.packageName = this.context.projectName
    }
    this.log.debug(`packageName: ${this.packageName}`)

    this.packageBundleFilename = paramCase(this.packageName)
    this.log.debug(`packageBundleFilename: ${this.packageBundleFilename}`)
  }
  prompting() {
    return inquirer.prompt([{
      type: 'checkbox',
      name: 'usages',
      message: `${chalk.green('How')} can the package be used?`,
      choices: [
        { name: 'AMD Module', value: 'amd' },
        { name: 'CommonJS Module', value: 'commonjs', checked: true },
        { name: 'ES2015 Module', value: 'esm' },
        { name: 'Script Tag', value: 'script' },
        { name: 'part of environment', value: 'env' }
      ],
      validate: (values) => values.length > 0
    }, {
      type: 'checkbox',
      name: 'platforms',
      message: `${chalk.green('Where')} can the package be used?`,
      choices: [
        { name: 'Browser', value: 'browser' },
        { name: 'Native NodeJS', value: 'node', checked: true },
        { name: 'others (e.g. atom)', value: 'others' }
      ],
      validate: (values) => values.length > 0,
      default: []
    }]).then((props) => {
      this.context.sourceUsages = props.usages as any
    })
  }
  writing() {
    const { projectFolder } = this.context
    const templatePath = resolve(__dirname, '../../templates/plain')

    this.fs.copy(
      join(templatePath, 'static/**/*'),
      projectFolder
    )

    this.fs.copy(
      join(templatePath, 'static/**/.*'),
      projectFolder
    )

    this.fs.copy(
      join(templatePath, 'static/.*/*'),
      projectFolder
    )

    this.fs.copy(
      join(templatePath, '_gitignore'),
      join(projectFolder, '.gitignore')
    )

    this.fs.copyTpl(
      join(templatePath, 'package.json'),
      join(projectFolder, 'package.json'),
      {
        ambient: !(~this.context.sourceUsages.indexOf('commonjs') ||
          ~this.context.sourceUsages.indexOf('amd') ||
          ~this.context.sourceUsages.indexOf('esm')) ? ' --ambient' : '',
        packagename: this.packageName,
        packageBundleFilename: this.packageBundleFilename,
        authorName: this.context.authorName,
        authorEmail: this.context.authorEmail,
        organization: this.context.organization,
        projectName: this.context.projectName,
        license: this.license
      }
    )

    this.fs.copyTpl(
      join(templatePath, `${this.license}.txt`),
      join(projectFolder, 'LICENSE'),
      {
        year: (new Date()).getFullYear(),
        author: `${this.context.authorUsername}${this.context.authorName ? ', ' + this.context.authorName : ''}${this.context.authorEmail ? ' (' + this.context.authorEmail + ')' : ''}`
      }
    )

    this.fs.copyTpl(
      join(templatePath, 'README.md'),
      join(projectFolder, 'README.md'),
      {
        organization: this.context.organization,
        projectName: this.context.projectName,
        packageName: this.packageName,
        CLI_VERSION
      }
    )
  }
  install() {
    // no op
  }
}
