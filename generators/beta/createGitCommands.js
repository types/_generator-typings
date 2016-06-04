'use strict'
const fs = require('fs');
const path = require('path');
const url = require('url');
const simpleGit = require('simple-git');

module.exports = function creatingGitCommands(generator, repositoryPath) {
  repositoryPath = path.resolve(repositoryPath);
  let repoExists = fs.existsSync(path.join(repositoryPath, '.git'));

  let git = new simpleGit(repositoryPath);

  function readGitConfig(name) {
    return new Promise((resolve, reject) => {
      let result;
      const child = generator.spawnCommand('git', ['config', name], { stdio: [0, 'pipe'] });
      child.on('close', (code) => {
        resolve(result);
      });

      child.stdout.on('data', (data) => {
        result = data.toString().trim();
      });
    });
  }

  function loadConfig() {
    return Promise.all([
      readGitConfig('user.username'),
      readGitConfig('user.name'),
      readGitConfig('user.email')
    ]).then((results) => {
      return {
        username: results[0],
        name: results[1],
        email: results[2]
      };
    });
  }

  function loadRepoInfo() {
    return new Promise((resolve) => {
      let result = {
        repositoryName: path.basename(repositoryPath),
        repositoryOrganization: path.basename(path.join(repositoryPath, '..'))
      };

      if (repoExists) {
        git.getRemotes(true, (err, out) => {
          const origins = out.filter((entry) => {
            return entry.name === 'origin';
          });

          if (origins.length > 0) {
            result.repositoryRemoteUrl = origins[0].refs.fetch;
            const u = url.parse(result.repositoryRemoteUrl);

            const parts = u.pathname.substring(1).split('/', 2);
            let repoName = parts[1];
            result.repositoryName = repoName.indexOf('.git') === repoName.length - 4 ? repoName.slice(0, -4) : repoName;
            result.repositoryOrganization = parts[0];
          }

          resolve(result);
        });
      }
      else {
        resolve(result);
      }
    });
  }
  return {
    loadConfig,
    loadRepoInfo,
    repoExists,
    clone: (remoteUrl) => {
      return new Promise((resolve, reject) => {
        git.clone(remoteUrl, repositoryPath, (err) => {
          if (err) {
            reject(err);
          }
          else {
            resolve();
          }
        });
      });
    },
    addSubmodule: (remoteUrl, localPath) => {
      return new Promise((resolve, reject) => {
        git.submoduleAdd(remoteUrl, localPath, (err) => {
          if (err) {
            reject(err);
          }
          else {
            resolve();
          }
        });
      });
    }
  };
};

