const streams = require('stream');
const jspm = require('jspm');
const run = require('tape-run');
const reporter = require('tap-spec');

const testFileGlobs = process.argv[2];
if (!testFileGlobs) {
  console.error('No test file globs specified.');
  process.exit(1);
}

new jspm.Builder()
  .buildStatic(testFileGlobs, { sourceMaps: 'inline' })
  .then((output) => {
    const reader = new streams.Readable();
    reader._read = function () { };
    reader.push(output.source);
    reader.push(null);
    reader
      .pipe(run())
      .on('results', (results) => {
        if (!results.ok) {
          process.exit(1);
        }
      })
      .pipe(reporter())
      .pipe(process.stdout);
  });
