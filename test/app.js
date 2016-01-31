'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-generator').test;

describe('generator-typings:app', function () {
  before(function (done) {
    helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts({url: 'https://github.com/unional/abc-def'})
      .on('end', done);
  });

  it('creates files', function () {
    assert.file([
      '.editorconfig',
      '.gitignore',
      'browser.d.ts',
      'main.d.ts',
      'README.md',
      'typings.json',
      'tsconfig.json'
    ]);
  });
});
