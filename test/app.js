'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('app', function () {
  before(function (done) {
    this.timeout(60000);
    helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts({
        sourceUri: 'visionmedia/batch',
        projectUri: 'typed-typings/npm-batch',
        // Set to false to avoid longer test time.
        isNpm: false,
        username: 'unional',
        license: 'MIT',
        name: 'unional'
      })
      .on('end', done);
  });

  it('creates files', function () {
    assert.file([
      '.vscode/settings.json',
      'test/test.ts',
      '.editorconfig',
      '.gitignore',
      'LICENSE',
      'index.d.ts',
      'README.md',
      'package.json',
      'typings.json',
      'tsconfig.json'
    ]);
  });
});
