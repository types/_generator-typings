import { paramCase } from 'change-case'
import { execSync } from 'child_process'
import { resolve, join } from 'path'

import { GeneratorContext, Generator } from '../utils/Generator'
import { CLI_VERSION } from '../utils/constants'
import { CommandOptions, ParsedArgs } from '../utils/command'

export class PlainProject extends Generator {
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
  context: GeneratorContext

  constructor(log, fs, store) {
    super(log, fs, store)
  }

  initializing(context: GeneratorContext, argv: ParsedArgs) {
    this.context = context
    this.license = argv.license
    this.log.debug(`license: ${this.license}`)

    try {
      const repoUrl = execSync(`npm info ${context.projectName} repository.url`).toString()
      this.packageName = repoUrl.indexOf(`${context.organization}/${context.projectName}`) === -1 ?
        `@${context.organization}/${context.projectName}` : context.projectName
    }
    catch (e) {
      this.packageName = context.projectName
    }
    this.log.debug(`packageName: ${this.packageName}`)

    this.packageBundleFilename = paramCase(this.packageName)
    this.log.debug(`packageBundleFilename: ${this.packageBundleFilename}`)
  }
  prompting() {
    // TODO
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
        ambient: !(~this.props.sourceUsages.indexOf('commonjs') ||
          ~this.props.sourceUsages.indexOf('amd') ||
          ~this.props.sourceUsages.indexOf('esm')) ? ' --ambient' : '',
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
