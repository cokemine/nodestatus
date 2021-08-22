const cp = require('child_process');
const fs = require('fs');
const { findModPath } = require('./utils');

const list = findModPath();

const argv = process.argv[2];

list.forEach(({ modPath, cmd }) => {
  if (fs.existsSync(`${modPath}/node_modules`)) {
    if (!argv || (argv && !argv.includes('force') && !argv.includes('-f'))) {
      return;
    }
  }
  cp.spawn(cmd, [ cmd.startsWith('npm') ? 'ci' : ' --frozen-lockfile' ], {
    env: process.env,
    cwd: modPath,
    stdio: 'inherit'
  });
});
