'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const extend = require('extend');

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

describe(GENERATOR_NAME, () => {
  it('skip submodule if source already exists', function () {
    let generator;

    this.timeout(5000);
    return helpers.run(path.join(__dirname, `../generators/${GENERATOR_NAME}`))
      .inTmpDir((dir) => {
        fs.writeFileSync('.generator-typingsrc', JSON.stringify(template));
        fs.mkdirSync('source');
      })
      .withOptions({
        skipGit: true
      })
      .withPrompts({
        sourceDeliveryType: 'npm',
        sourceDeliveryPackageName: 'nop',
        sourceUsages: ['commonjs'],
        sourcePlatforms: ['node', 'browser'],
        useGeneratedValues: true
      })
      .on('ready', (gen) => {
        generator = gen;
      })
      .toPromise()
      .then(() => {
        return new Promise((r) => {
          fs.rmdir('source', (err) => {
            assert(!err);
            r();
          });
        });
      });
  });
  it('uses typingsName', function () {
    let generator;

    this.timeout(5000);
    return helpers.run(path.join(__dirname, `../generators/${GENERATOR_NAME}`))
      .inTmpDir((dir) => {
        fs.writeFileSync('.generator-typingsrc', JSON.stringify(template));
      })
      .withArguments(['testtype'])
      .withOptions({
        skipGit: true
      })
      .withPrompts({
        sourceDeliveryType: 'npm',
        sourceDeliveryPackageName: 'nop',
        sourceUsages: ['commonjs'],
        sourcePlatforms: ['node', 'browser'],
        useGeneratedValues: true
      })
      .on('ready', (gen) => {
        generator = gen;
      })
      .toPromise()
      .then((dir) => {
        let root = generator.destinationRoot();
        assert.equal(path.basename(root), 'testtype');
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

  describe('update template', () => {
    it('update and use template', function () {
      this.timeout(5000);
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
            sourcePlatforms: ['node', 'browser'],
            useGeneratedValues: true
          }
        ))
        .toPromise()
        .then(() => {
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
          assert.jsonFileContent('package.json', {
            scripts: {
              build: 'echo building... && typings bundle -o out/index.d.ts',
              'all-tests': 'npm test && npm run browser-test'
            }
          });
          assert.jsonFileContent('typings.json', {
            name: 'nop',
            main: 'index.d.ts',
            homepage: 'https://github.com/supershabam/nop'
          });
          assert.fileContent([
            ['README.md', /# Typed Nop/]
          ])
        });
    });
  });
  it('generate npm package using default template', function () {
    let generator;

    this.timeout(5000);
    return helpers.run(path.join(__dirname, `../generators/${GENERATOR_NAME}`))
      .inTmpDir((dir) => {
        fs.writeFileSync('.generator-typingsrc', JSON.stringify(template));
      })
      .withOptions({
        skipGit: true
      })
      .withPrompts({
        sourceDeliveryType: 'npm',
        sourceDeliveryPackageName: 'nop',
        sourceUsages: ['commonjs'],
        sourcePlatforms: ['node'],
        useGeneratedValues: true,
      })
      .on('ready', (gen) => {
        generator = gen;
      })
      .toPromise();
  });
  it('generator npm package using custom values', () => {
    let generator;
    return helpers.run(path.join(__dirname, `../generators/${GENERATOR_NAME}`))
      .withPrompts({
        sourceDeliveryType: 'npm',
        sourceDeliveryPackageName: 'nop',
        sourceUsages: ['commonjs'],
        sourcePlatforms: ['node'],
        useGeneratedValues: false,
        username: 'someone',
        repositoryOrganization: 'someorg',
        repositoryName: 'somerepo',
        testFramework: 'blue-tape',
        browserTestHarness: 'tape-run+jspm',
        license: 'ISC',
        licenseSignature: 'happy'
      })
      .withOptions({
        skipGit: true
      })
      .on('ready', (gen) => {
        generator = gen;
      })
      .toPromise()
      .then(() => {
        assert.objectContent(generator.props, {
          username: 'someone',
          repositoryOrganization: 'someorg',
          repositoryName: 'somerepo',
          testFramework: 'blue-tape',
          browserTestHarness: 'tape-run+jspm',
          license: 'ISC',
          licenseSignature: 'happy'
        });
      });
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
          useGeneratedValues: false,
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
          useGeneratedValues: false,
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
