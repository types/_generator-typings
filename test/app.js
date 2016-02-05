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
        packageName: 'typed-reactDOM',
        username: 'unional'
      })
      .on('end', done);
  });

  it('creates files', function () {
    assert.file([
      'test/test.ts',
      'test/tsconfig.json',
      '.editorconfig',
      '.gitignore',
      'LICENSE',
      'main.d.ts',
      'README.md',
      'package.json',
      'typings.json',
      'tsconfig.json'
    ]);
  });
});
