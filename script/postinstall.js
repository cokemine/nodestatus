const cp = require('child_process');
const { findModPath } = require('./utils');

const list = findModPath();

list.forEach(({ modPath, cmd }) => {
  cp.spawn(cmd, [ cmd.startsWith('npm') ? 'ci' : ' --frozen-lockfile' ], {
    env: process.env,
    cwd: modPath,
    stdio: 'inherit'
  });
});
