# generator-typings

[![NPM version][npm-image]][npm-url]
[![downloads][downloads-image]][downloads-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Build Status][travis-image]][travis-url] [![License][license-image]][license-url]

> Yeoman generator for typings (next-gen of tsd/DefinitelyTyped) project

## Upgrade to typings@1.0

There are a few changes in `typings@1.0` compare to previous version. When you update your typings to use `typings@1.0`, you need to do the following:

```js
// tsconfig.json
// from
{
  "exclude": [
    "typings/browser",
    "typings/browser.d.ts",
    "out/browser.d.ts",
    ...
  ]
}

// to
{
  "exclude": [
    "typings/globals",
    "typings/modules",
    "out",
    ...
  ]
}
```

```js
// package.json
// from
{
  "scripts": {
    "build": "echo building... && typings bundle -o out",
    ...
  }
}

// to
{
  "scripts": {
    "build": "echo building... && typings bundle -o out/<main>.d.ts", // fill in <main>
    ...
  }
}
```

```js
// test/tsconfig.json and/or source-test/tsconfig.json
// from
{
  "files": [
    "../typings/main.d.ts",
    "../out/main.d.ts"
  ]
}

// to
{
  "files": [
    "../typings/index.d.ts",
    "../out/<main>.d.ts" // fill in <main>
  ]
}
```

And update `typings.json` as `ambient` is now `global`

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

Then generate your new project:

```sh
# create a git repo from github
# clone it locally to your machine
# in that directory:
yo typings
```

## How to write typings

- https://github.com/typings/typings
- https://github.com/typings/typings/blob/master/docs/faq.md
- https://github.com/typings/typings/blob/master/docs/examples.md
- https://github.com/unional/typescript/blob/master/style-guide/typings/README.md

## About writing tests for typings

Simply shape test (like those in DefinitlyType) is not sufficient.
Since there is no type in javascript, even if you create a wrong signature, you won't detect it until runtime.

e.g.

```js
// source code
function foo(something) {
  return something++;
}
```

The source code expects `something` to be a number. But in your typings:

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
