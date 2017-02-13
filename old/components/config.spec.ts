import { resolve, relative } from 'path'
import test from 'ava'
import fixture from 'ava-fixture'

import { readOldConfig, convertOldConfig } from './config.utils'
import { where, read } from './config.logic'

const ftest = fixture(test, './fixtures/cases')

ftest('config.where', 'config', (t, cwd) => {
  const result = where()
  const actual = relative(cwd, result || '')
  t.is(actual, '.typingsreporc')
})
