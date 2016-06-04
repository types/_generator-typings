const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const extend = require('extend');
const simpleGit = require('simple-git');


const GENERATOR_NAME = 'beta';

const template = {
  username: 'abc',
  repositoryOrganization: 'dev',
  repositoryNamePrefix: '1df',
  testFramework: 'blue-tape',
  browserTestHarness: 'tape-run+jspm',
  license: 'ISC',
  licenseSignature: 'ahhhh'
};

describe(`${GENERATOR_NAME} template tests`, () => {
  it('update template', () => {
    var generator;
    return helpers.run(path.join(__dirname, `../generators/${GENERATOR_NAME}`))
      .withOptions({
        updateTemplate: true,
        skipCache: true,
        skipConfiguring: true,
        skipDefault: true,
        skipWriting: true,
        skipInstall: true,
        skipGit: true
      })
      .withPrompts(template)
      .on('ready', (gen) => {
        generator = gen;
      })
      .toPromise()
      .then((dir) => {
        assert.objectContent(generator.configTemplate, template);
      });
  });
});
