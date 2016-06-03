'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const extend = require('extend');

const GENERATOR_NAME = 'beta';

const template = {
  username: 'unional',
  repositoryOrganization: 'unional',
  repositoryNamePrefix: 'typed-',
  testFramework: 'blue-tape',
  browserTestHarness: 'tape-run+jspm',
  license: 'MIT',
  licenseSignature: 'unional'
};

describe(GENERATOR_NAME, () => {
  describe('update template', () => {
    before(() => {
      return helpers.run(path.join(__dirname, `../generators/${GENERATOR_NAME}`))
        .withOptions({
          updateTemplate: true,
          skipGit: true
        })
        .withPrompts(extend(
          template,
          {
            sourceDeliveryType: 'npm',
            sourceDeliveryPackageName: 'nop',
            sourceUsages: ['commonjs'],
            sourcePlatforms: ['node'],
            usePresetValues: true
          }
        ))
        .toPromise();
    });

    it('update and use template', () => {
      assert.file([
        'package.json',
        'tsconfig.json',
        'tslint.json',
        '.editorconfig',
        '.travis.yml',
        '.gitignore',
        'typings.json',
        'README.md',
        'index.d.ts',
        'LICENSE',
        'source-test/README.md',
        'source-test/tsconfig.json',
        'test/tsconfig.json',
        'test/test.ts'
      ]);
    });
  });
  it('generate npm package using default template', () => {
      return helpers.run(path.join(__dirname, `../generators/${GENERATOR_NAME}`))
        .withPrompts({
          sourceDeliveryType: 'npm',
          sourceDeliveryPackageName: 'nop',
          sourceUsages: ['commonjs'],
          sourcePlatforms: ['node'],
          usePresetValues: true,
        })
        .withOptions({
          skipGit: true
        })
        .toPromise();
  });
  it('generator npm package using custom values', () => {
      return helpers.run(path.join(__dirname, `../generators/${GENERATOR_NAME}`))
        .withPrompts({
          sourceDeliveryType: 'npm',
          sourceDeliveryPackageName: 'nop',
          sourceUsages: ['commonjs'],
          sourcePlatforms: ['node'],
          usePresetValues: false,
          username: 'unional',
          repositoryOrganization: 'typed-typings',
          repositoryName: 'npm-nop',
          testFramework: 'blue-tape',
          browserTestHarness: 'tape-run+jspm',
          license: 'MIT',
          licenseSignature: 'unional'
        })
        .withOptions({
          skipGit: true
        })
        .toPromise();
  })
  describe.skip('http dryrun', function () {
    before(function (done) {
      this.timeout(60000);
      helpers.run(path.join(__dirname, `../generators/${GENERATOR_NAME}`))
        .withPrompts({
          sourceDeliveryType: 'http',
          sourceDeliveryPackageName: '6px',
          sourceDeliveryUrl: 'https://cdnjs.cloudflare.com/ajax/libs/6px/1.0.3/6px.min.js',
          sourceUsages: ['script'],
          sourceVersion: '1.0.3',
          sourcePlatforms: ['browser'],
          useExistingRepository: false,
          username: 'unional',
          fullname: 'Homa Wong',
          email: 'homawong@gmail.com',
          repositoryOrganization: 'typed-typings',
          repositoryNamePrefix: 'typed-',
          testFrameworkInNode: 'blue-tape',
          testFrameworkInBrowser: 'blue-tape',
          license: 'MIT'
        })
        .withOptions({
          skipInstall: true
        })
        .on('end', done);
    });

    it('creates files', function () {
    });
  });
  describe.skip('bower dryrun', function () {
    before(function (done) {
      this.timeout(60000);
      helpers.run(path.join(__dirname, `../generators/${GENERATOR_NAME}`))
        .withPrompts({
          sourceDeliveryType: 'bower',
          sourceDeliveryPackageName: 'domready',
          sourceUsages: ['commonjs'],
          sourcePlatforms: ['node'],
          useExistingRepository: false,
          username: 'unional',
          repositoryOrganization: 'typed-typings',
          repositoryNamePrefix: 'typed-',
          testFrameworkInNode: 'blue-tape',
          testFrameworkInBrowser: 'blue-tape',
          license: 'MIT'
        })
        .on('end', done);
    });

    it('creates files', function () {
    });
  });
});
