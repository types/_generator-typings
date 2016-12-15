import { execSync } from 'child_process'
import path = require('path')
import fs = require('fs')
import url = require('url')
import simpleGit = require('simple-git')

export interface RepositoryInfo {
  name: string,
  organization: string
  exists: boolean
  path: string
  remoteUrl?: string
}

export class Git {
  private git: simpleGit.Git

  constructor(public repositoryPath: string) {
    this.git = simpleGit(repositoryPath)
  }

  getRepositoryInfo(): Promise<RepositoryInfo> {
    return new Promise((resolve) => {
      console.log(this.repositoryPath)
      let result: RepositoryInfo = {
        exists: fs.existsSync(path.join(this.repositoryPath, '.git')),
        name: path.basename(this.repositoryPath),
        organization: path.basename(path.join(this.repositoryPath, '..')),
        path: this.repositoryPath
      }

      if (result.exists) {
        this.git.getRemotes(true, (err, out) => {
          const origins = out.filter((entry) => {
            return entry.name === 'origin'
          })

          if (origins.length > 0) {
            const remoteUrl: string = origins[0].refs.fetch
            result.remoteUrl = remoteUrl
            const u = url.parse(remoteUrl)
            if (u.pathname) {
              const parts = u.pathname.substring(1).split('/', 2)
              let repoName = parts[1]
              result.name = repoName.indexOf('.git') === repoName.length - 4 ? repoName.slice(0, -4) : repoName
              result.organization = parts[0]
            }
          }

          resolve(result)
        })
      }
      else {
        resolve(result)
      }
    })
  }
  clone(remoteUrl: string) {
    return new Promise((resolve, reject) => {
      this.git.clone(remoteUrl, this.repositoryPath, (err) => {
        if (err) {
          reject(err)
        }
        else {
          resolve()
        }
      })
    })
  }
  addSubmodule(remoteUrl: string, localPath: string) {
    return new Promise((resolve, reject) => {
      this.git.submoduleAdd(remoteUrl, localPath, (err) => {
        if (err) {
          reject(err)
        }
        else {
          resolve()
        }
      })
    })
  }
}

export function getConfigValue(name: string): string {
  return execSync(`git config ${name}`, { stdio: [0, 'pipe'] }).toString()
}
