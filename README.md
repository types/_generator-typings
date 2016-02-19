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
yo typings
```

## Getting To Know Yeoman

Yeoman has a heart of gold. He&#39;s a person with feelings and opinions, but he&#39;s very easy to work with. If you think he&#39;s too opinionated, he can be easily convinced. Feel free to [learn more about him](http://yeoman.io/).

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
* [ ] install target source automatically
* [ ] Add supporting utilities and settings
  * [x] Add `tslint.json`
* [ ] Add validation to check if the d.ts file created correctly.
* [ ] Automate PR creation on `typings/registry`
