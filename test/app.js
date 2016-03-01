'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-generator').test;

describe('generator-typings:app', function () {
  before(function (done) {
    this.timeout(30000);
    helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts({
        sourceUri: 'facebook/reactDOM',
        projectUri: 'unional/typed-reactDOM',
        isNpm: false,
        username: 'unional'
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
