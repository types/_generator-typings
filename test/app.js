'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('app', function() {
  it('should run the current generator', function(done) {
    helpers.run(path.join(__dirname, '../generators/app'))
      .withGenerators([
        [helpers.createDummyGenerator(), 'typings:current'],
      ])
      .on('end', () => {
        done();
      });
  });
  it('should run the beta generator', function(done) {
    helpers.run(path.join(__dirname, '../generators/app'))
      .withGenerators([
        [helpers.createDummyGenerator(), 'typings:beta']
      ])
      .withOptions({ beta: true })
      .on('end', () => {
        done();
      });
  });
});
