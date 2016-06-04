
const globby = require('globby');
const browserify = require('browserify');
const tsify = require('tsify');
const run = require('tape-run');
const spec = require('tap-spec');

var glob = process.argv.slice(2);
if (glob.length === 0){
  glob = ['test/**/*.ts', 'typings/main.d.ts', 'out/main.d.ts'];
}

globby(glob).then((entries) => {
  var b = browserify({
    entries: entries
  })
  .plugin(tsify)
  .bundle()
  .pipe(run())
  .pipe(spec())
  .pipe(process.stdout);
});
