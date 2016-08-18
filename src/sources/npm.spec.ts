import test from 'ava'

import { read } from './npm'

test('npm.read', t => {
  return read('nop')
    .then(info => {
      console.log(info)
      t.pass('ok')
    })
})
