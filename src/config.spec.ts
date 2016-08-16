import { resolve, relative } from 'path'
import test from 'ava'
import fixture from 'ava-fixture'

import { readOldConfig, convertOldConfig, getPrintMessage } from './config.utils'
import { where, list } from './config'

const ftest = fixture(test, '../fixtures/cases')

ftest('config.utils.readOldConfig', 'config-old', (t, cwd) => {
  const config = readOldConfig()
  t.is((config as any).config, resolve('.generator-typingsrc'), 'does read local old config')
})

ftest('config.utils.convertOldConfig', 'config-old', (t, cwd) => {
  const oldConfig = readOldConfig()
  const config = convertOldConfig(oldConfig)
  t.deepEqual(config, {
    githubUsername: 'unional',
    githubOrganization: 'unional',
    license: 'MIT',
    licenseSignature: 'unional',
    mode: 'with-test',
    features: [],
    serverTestFramework: 'blue-tape',
    browserTestFramework: 'blue-tape',
    browserTestHarness: 'tape-run+jspm',
    config: resolve('.generator-typingsrc')
  } as any)
})

ftest('config.list', 'config', t => {
  const actual = list()
  t.is(actual,
    getPrintMessage({
      githubUsername: 'unional',
      githubOrganization: 'unional',
      license: 'MIT',
      licenseSignature: 'unional',
      mode: 'with-test',
      features: [ 'travis' ],
      serverTestFramework: 'ava',
      browserTestFramework: 'ava',
      browserTestHarness: 'jsdom'
    }),
    'prints out all configs')
})

ftest('config.where', 'config', (t, cwd) => {
  const actual = relative(cwd, where())
  t.is(actual, '.typingsreporc')
})
