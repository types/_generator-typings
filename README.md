# generator-typings

[![NPM version][npm-image]][npm-url]
[![downloads][downloads-image]][downloads-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Build Status][travis-image]][travis-url]
[![Appveyor status][appveyor-image]][appveyor-url]
[![License][license-image]][license-url]

> Yeoman generator for typings (next-gen of tsd/DefinitelyTyped) project

Upgrade from previous version? Make sure you check the [upgrade doc](./UPGRADE.md)

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
    - [ ] vows
  - Client side
    - [ ] [`blue-tape`](https://www.npmjs.com/package/blue-tape) (through tape-run)
    - [ ] mocha (through mocha-phantomjs, karma-mocha)
    - [ ] jasmine
    - [ ] QUnit
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

## Usage

There are several ways to create your typings repository:

Here are examples to create [`npm-noop2`](https://github.com/typed-typings/npm-noop2)

```sh
# create the github repo from github website
# under your organization folder (e.g. /somewhere/typed-typings/)
yo typings npm-noop2

# Once it is done,
cd npm-noop2
```

```sh
# create the github repo from github website
# clone it locally to your machine (e.g. into /somewhere/typed-typings/npm-noop2/)
# in that directory:
yo typings
```

```sh
# create the github repo from github website
# under your organization folder (e.g. /somewhere/typed-typings/)
mkdir npm-noop2 && cd npm-noop2
yo typings
```



## How to write typings

- https://github.com/typings/typings
- https://github.com/typings/typings/blob/master/docs/faq.md
- https://github.com/typings/typings/blob/master/docs/examples.md
- https://github.com/unional/typescript/tree/master/pages/typings

## About writing tests for typings

Simply shape test (like those in DefinitelyTyped) is not sufficient.
Since there is no type in javascript, even if you create a wrong signature, you won't detect it until runtime.

e.g.

```js
// source code
function foo(something) {
  return something++;
}
```

The source code expects `something` to be a number. If you write your typings as:

```ts
function foo(something: string): string;
```

It won't fail until you use it. i.e.

```ts
// consumer program
import foo ....somehow

let x = "abc";
foo(x);
```

Because your typings provide guidance to the consumer, they will write their code that way and will fail when they run it.
`tsc` will compile fine.

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
[appveyor-image]: https://ci.appveyor.com/api/projects/status/hsl5yotnplivq8b9/branch/master?svg=true
[appveyor-url]: https://ci.appveyor.com/project/unional/generator-typings/branch/master
