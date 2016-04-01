# generator-typings

[![NPM version][npm-image]][npm-url]
[![downloads][downloads-image]][downloads-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Build Status][travis-image]][travis-url] [![License][license-image]][license-url]

> Yeoman generator for typings (next-gen of tsd/DefinitelyTyped) project

## Upgrade Note
Starting from `0.14`, the generated project will use `tslint@3.7.0` as the `extends` feature lands.
In previous verison, you the generated project might have `tslint.json` like this:

```js
{
  "extends": "typings"
}
```

The official `extends` feature does not support package shorthand.
So you need to change your `tslint.json` to:

```js
{
  "extends": "tslint-config-typings"
}
```

## Features
- [x] Basic scaffolding
- Source delivery mechanisms
  - [x] npm
  - [ ] bower
  - [ ] github
  - [ ] jspm
- Source hostings providers
  - [x] github
  - [ ] bitbucket
  - [ ] gitlab
  - [ ] custom
- [x] Install target source automatically
- [x] Add source as submodule
- Install supporting utilities and settings
  - [x] [`tslint for typings`](https://github.com/typings/tslint-config-typings)
- Test harness
  - Server side
    - [x] [`blue-tape`](https://www.npmjs.com/package/blue-tape)
    - [ ] mocha
  - Client side
    - [ ] [`blue-tape`](https://www.npmjs.com/package/blue-tape) (through tape-run)
    - [ ] mocha (through mocha-phantomjs, karma-mocha)
    - [ ] jasmine
- npm commands
  - [x] watch: Build typings for testing automatically
  - [ ] publish: Create PR to [`typings/registry`](https://github.com/typings/registry)
  - individual commands
    - [x] build: Build typings for testing
    - [x] lint: Run tslint
    - [x] test: Run tests
    - [x] source-test: Run tests transferred from source

## Installation
First, install [Yeoman](http://yeoman.io) and generator-typings using [npm](https://www.npmjs.com/).

```sh
npm install -g yo
npm install -g generator-typings
```

Then generate your new project:

```sh
# create a git repo form github
# clone it locally to your machine
# in that directory:
yo typings
```

## How to write typings
- https://github.com/typings/typings
- https://github.com/typings/typings/blob/master/docs/faq.md
- https://github.com/typings/typings/blob/master/docs/examples.md
- https://github.com/unional/typescript/blob/master/style-guide/typings/README.md

## License
MIT © [unional](https://github.com/unional)


[npm-image]: https://badge.fury.io/js/generator-typings.svg
[npm-url]: https://npmjs.org/package/generator-typings
[downloads-image]: https://img.shields.io/npm/dm/generator-typings.svg?style=flat
[downloads-url]: https://npmjs.org/package/generator-typings
[travis-image]: https://travis-ci.org/typings/generator-typings.svg?branch=master
[travis-url]: https://travis-ci.org/typings/generator-typings
[daviddm-image]: https://david-dm.org/typings/generator-typings.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/typings/generator-typings
[license-image]: http://img.shields.io/:license-mit-blue.svg?style=flat-square
[license-url]: http://unional.mit-license.org
