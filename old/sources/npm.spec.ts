import test from 'ava'

import { read } from './npm'

test('npm.read', t => {
  return read('nop')
    .then(info => {
      t.deepEqual(info, {
        type: 'npm',
        name: 'nop',
        main: 'index',
        version: '1.0.0',
        homepage: 'https://github.com/supershabam/nop',
        gitUrl: 'git://github.com/supershabam/nop'
      })
    })
})
