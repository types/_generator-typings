'use strict'
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const extend = require('extend');
const simpleGit = require('simple-git');


const GENERATOR_NAME = 'app';

const template = {
  username: 'unional',
  repositoryOrganization: 'unional',
  repositoryNamePrefix: 'typed-',
  testFramework: 'blue-tape',
  browserTestHarness: 'tape-run+jspm',
  license: 'MIT',
  licenseSignature: 'unional'
};

describe(`${GENERATOR_NAME} git tests`, () => {
  it.only('should use current and parent dir as repo name and org when it is not a git repo', () => {
    console.log('starting test');
    let generator;
    return helpers.run(path.join(__dirname, `../generators/${GENERATOR_NAME}`))
      .withOptions({
        skipConfiguring: true,
        skipDefault: true,
        skipWriting: true,
        skipInstall: true,
        skipGit: true
      })
      .on('ready', (gen) => {
        console.log('ready to go');
        generator = gen;
      })
      .toPromise()
      .then((dir) => {
        console.log('inside then', dir);
        let currentDir = path.basename(dir);
        let parentDir = path.basename(path.resolve(dir, '..'));
        assert.objectContent(generator.props, {
          repositoryName: currentDir,
          repositoryOrganization: parentDir,
        });
      });
  });
  it('should clone the github repo', function () {
    let generator;
    this.timeout(5000);
    return helpers.run(path.join(__dirname, `../generators/${GENERATOR_NAME}`))
      .withOptions({
        skipConfiguring: true,
        skipDefault: true,
        skipWriting: true,
        skipInstall: true
      })
      .withPrompts({
        sourceDeliveryType: 'npm',
        sourceDeliveryPackageName: 'nop',
        sourceUsages: ['commonjs'],
        sourcePlatforms: ['node'],
        useGeneratedValues: false,
        repositoryName: 'generator-typings-blank-repo-for-test',
        repositoryOrganization: 'typings'

      })
      .on('ready', (gen) => {
        generator = gen;
      })
      .toPromise()
      .then((dir) => {
        assert.objectContent(generator.props, {
          repositoryName: 'generator-typings-blank-repo-for-test',
          repositoryOrganization: 'typings'
        });
        assert.file('.git');
      });
  });
  it('when it is a cloned git repo', () => {
    let generator;
    return helpers.run(path.join(__dirname, `../generators/${GENERATOR_NAME}`))
      .inTmpDir((dir) => {
        let git = simpleGit(dir);
        return new Promise((resolve) => {
          git.clone('https://github.com/typings/generator-typings-blank-repo-for-test', '.', () => {
            console.log('git clone completed');
            resolve();
          });
        });
      })
      .withOptions({
        skipConfiguring: true,
        skipDefault: true,
        skipWriting: true,
        skipInstall: true,
        skipGit: true
      })
      .on('ready', (gen) => {
        console.log('helper say ready');
        generator = gen;
      })
      .toPromise()
      .then((dir) => {
        assert.objectContent(generator.props, {
          repositoryName: 'generator-typings-blank-repo-for-test',
          repositoryOrganization: 'typings',
        });
      });
  });
});
