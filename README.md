# generator-typings [![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Build Status][travis-image]][travis-url] [![License][license-image]][license-url]

> Yeoman generator for typings (next-gen of tsd/DefinitelyTyped) project

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

## TODO List
* [x] Basic scaffolding
* [ ] Support multiple source hostings providers
  * [x] github
* [ ] Support multiple source distribution channels
  * [x] npm
  * [ ] bower
  * [ ] github
  * [ ] gitlab
* [x] install target source automatically
* [ ] Add supporting utilities and settings
  * [x] Add `tslint.json`
  * [x] Add `is-callable`
* [x] Add validation to check if the d.ts file created correctly.
* [x] Add watch command
* [ ] Automatically create PR to [`typings/registry`](https://github.com/typings/registry)
