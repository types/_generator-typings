import { spawnSync } from 'child_process'
import path = require('path')
import Promise = require('any-promise')

import { PackageInfo } from './interfaces'

export function read(name: string): Promise<PackageInfo> {
  return new Promise((resolve, reject) => {
    const result: PackageInfo = { type: 'npm', name }
    const child = spawnSync('npm', ['info', name, '--json'], { stdio: [0, 'pipe'] })
    if (child.status !== 0) {
      const { status, error } = child
      reject({ status, error })
    }

    const stdout = child.stdout.toString()
    const pjson = JSON.parse(stdout)
    if (pjson.main) {
      const main = path.parse(pjson.main)
      result.main = path.join(main.dir, main.name)
    }
    else {
      result.main = 'index'
    }
    result.version = pjson.version
    result.homepage = pjson.homepage
    if (pjson.repository) {
      if (typeof pjson.repository === 'string') {
        result.gitUrl = pjson.repository
      }
      else if (pjson.repository.type === 'git') {
        // Example: npm-firebase has repository.type === 'none'
        result.gitUrl = pjson.repository.url
      }
    }

    resolve(result)
  })
}
