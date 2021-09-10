const cp = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const { findModPath } = require('./utils');

const list = findModPath();

const argv = process.argv[2];

const isDocker = process.env.IS_DOCKER === 'true';

list.forEach(({ modPath, cmd }) => {
  if (fs.pathExistsSync(`${modPath}/node_modules`)) {
    if (!argv || (argv && !argv.includes('force') && !argv.includes('-f'))) {
      return;
    }
  }
  let pkgManager = '';
  let command = [];
  let yarnCache = path.resolve(modPath, '.yarncache');
  cmd.startsWith('npm') && (pkgManager = 'npm');
  cmd.startsWith('yarn') && (pkgManager = 'yarn');
  if (!pkgManager) {
    console.log('Something wrong while fetching submodules');
    process.exit(1);
  }
  if (cmd === 'npm') {
    command = [ 'ci' ];
  } else if (cmd === 'yarn') {
    command = [ '--frozen-lockfile' ];
    if (isDocker) {
      fs.ensureDirSync(yarnCache);
      command = [ ...command, '--cache-folder', './.yarncache' ];
    }
  }
  const install = cp.spawn(cmd, command, {
    env: process.env,
    cwd: modPath,
    stdio: 'inherit'
  });
  install.on('close', code => {
    if (!code) {
      fs.removeSync(yarnCache);
    } else {
      console.log('An error occurred while installing the dependency of submodules');
      process.exit(code);
    }
  });
});
