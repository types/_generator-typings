# generator-typings [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> Yeoman generator for typings (next-gen of tsd/DefinitelyTyped) package

## Installation

First, install [Yeoman](http://yeoman.io) and generator-typings using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

```bash
npm install -g yo
npm install -g generator-typings
```

Then generate your new project:

```bash
mkdir typed-abc
cd typed-abc
yo typings
```

## License

MIT © [unional](https://github.com/unional)


[npm-image]: https://badge.fury.io/js/generator-typings.svg
[npm-url]: https://npmjs.org/package/generator-typings
[travis-image]: https://travis-ci.org/unional/generator-typings.svg?branch=master
[travis-url]: https://travis-ci.org/unional/generator-typings
[daviddm-image]: https://david-dm.org/unional/generator-typings.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/unional/generator-typings

## TODO List
* [x] Basic scaffolding
* [ ] Support non github source package
* [x] install target source automatically
* [ ] Add supporting utilities and settings
  * [x] Add `tslint.json`
* [x] Add validation to check if the d.ts file created correctly.
* [ ] Automate PR creation on `typings/registry`
