# Typed <%- prettyPackageName %>  [![Build Status](https://travis-ci.org/<%- organization %>/<%- packageName %>.svg?branch=master)](https://travis-ci.org/<%- organization %>/<%- packageName %>)


The type definition for [`<%- sourcePackageName %>`](<%- sourcePackageUrl %>)

## LICENSE

<%- license %>

## Contributing

```sh
# Fork this repo
npm install

npm run watch

# add tests, make changes, pass tests ... then [ctrl+c]
npm run publish
```

## Updating

Update `typings.json/version` to match the source version you are typing against.
e.g. if you are creating typings for `chai@3.5.0`, then:

```js
// typings.json
{
  "version": "3.5.0"
  // ...
}
```

----

Created by [`generator-typings`](https://github.com/typings/generator-typings)

[![generator-typings NPM version][generator-typings-npm-image]][generator-typings-npm-url]

[generator-typings-npm-image]: https://badge.fury.io/js/generator-typings.svg
[generator-typings-npm-url]: https://npmjs.org/package/generator-typings
