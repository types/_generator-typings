import test from 'ava'

import { CLI_NAME } from './constants'

test('CLI_NAME', t => {
  t.is(CLI_NAME, 'createtypings')
})
