import memfs = require('mem-fs')
import memfsEditor = require('mem-fs-editor')

const store = memfs.create()
export const fs = memfsEditor.create(store)
