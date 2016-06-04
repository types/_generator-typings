# Upgrade note

## Upgrade from pre-beta and pre-1.0

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

// Also change `ambient` to `global` if needed
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

## Upgrade from < 0.14

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
