'use strict';

const cp = require('child_process');

let compiling = true;
cp.spawn('tsc', ['-w'], { shell: true })
  .stdout.on('data', data => {
    console.log(data.toString())
    if (compiling) {
      compiling = false;
      cp.spawn('ava', ['-w', process.argv[2]], {
        stdio: 'inherit',
        shell: true
      });
    }
    cp.spawnSync('npm', ['run', 'lint'], {
      stdio: 'inherit',
      shell: true
    })
  })
