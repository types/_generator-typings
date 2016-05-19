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
