import onchange = require('onchange');

onchange(process.argv.slice(2), 'npm', ['run', 'build'], {});
