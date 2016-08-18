import path = require('path')
import test from 'ava'
import fixture from 'ava-fixture'

import { Git } from './git'

const ftest = fixture(test, '../fixtures/cases')

ftest('git', 'config-old', (t, cwd) => {
  const git = new Git()
  t.is(git.repositoryPath, cwd)
  return git.getRepositoryInfo()
    .then(info => {
      t.is(info.exists, false)
      t.is(info.suggestedName, path.basename(cwd))
      t.is(info.suggestedOrganization, path.basename(path.resolve(cwd, '..')))
    })
})
