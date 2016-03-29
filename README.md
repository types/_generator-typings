# generator-typings [![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Build Status][travis-image]][travis-url] [![License][license-image]][license-url]

> Yeoman generator for typings (next-gen of tsd/DefinitelyTyped) project

## Features
* [x] Basic scaffolding
* [ ] Support multiple source hostings providers
  * [x] github
  * [ ] gitlab
  * [ ] custom
* [ ] Support multiple source delivery channels
  * [x] npm
  * [ ] bower
  * [ ] github
  * [ ] jspm
* [x] Install target source automatically
* [x] Add source as submodule
* [ ] Install supporting utilities and settings
  * [x] [`tslint.json`](https://github.com/typings/tslint-config-typings) for typings
* [x] Default test harness: [`blue-tape`](https://www.npmjs.com/package/blue-tape)
* [ ] Custom test harness
  * [ ] Mocha
  * [ ] Jasmine
* [ ] npm commands
  * [x] watch: Build typings for testing automatically
  * [ ] publish: Create PR to [`typings/registry`](https://github.com/typings/registry)
  * individual commands
    * [x] build: Build typings for testing
    * [x] lint: Run tslint
    * [x] test: Run tests
    * [x] source-test: Run tests transferred from source

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
[travis-image]: https://travis-ci.org/typings/generator-typings.svg?branch=master
[travis-url]: https://travis-ci.org/typings/generator-typings
[daviddm-image]: https://david-dm.org/typings/generator-typings.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/typings/generator-typings
[license-image]: http://img.shields.io/:license-mit-blue.svg?style=flat-square
[license-url]: http://unional.mit-license.org
