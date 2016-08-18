import { spawnSync } from 'child_process'
import path = require('path')
import Promise = require('any-promise')

export function read(packageName: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const result: any = {}
    const child = spawnSync('npm', ['info', packageName, '--json'], { stdio: [0, 'pipe'] })
    if (child.status !== 0) {
      const { status, error } = child
      reject({ status, error })
    }

    const stdout = child.stdout.toString()
    const pjson = JSON.parse(stdout)
    if (pjson.main) {
      const main = path.parse(pjson.main)
      result.sourceMain = path.join(main.dir, main.name)
    }
    else {
      result.sourceMain = 'index'
    }
    result.sourceVersion = pjson.version
    result.sourceHomepage = pjson.homepage
    if (pjson.repository) {
      if (typeof pjson.repository === 'string') {
        result.sourceRepository = pjson.repository
      }
      else if (pjson.repository.type === 'git') {
        // Example: npm-firebase has repository.type === 'none'
        result.sourceRepository = pjson.repository.url
      }
    }

    resolve(result)
  })
}
