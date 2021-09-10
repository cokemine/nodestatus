const cp = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const { findModPath } = require('./utils');

const list = findModPath();

const outputDir = path.resolve(__dirname, '../dist');

if (fs.pathExistsSync(outputDir)) {
  fs.removeSync(outputDir);
}

process.env.GENERATE_SOURCEMAP = 'false';

list.forEach(({ modPath, cmd }) => {
  const build = cp.spawn(cmd, [ 'run', 'build' ], {
    env: process.env,
    cwd: modPath,
    stdio: 'inherit'
  });
  build.on('close', code => {
    if (!code) {
      const buildDirName = fs.existsSync(`${modPath}/dist`) ? 'dist' : 'build';
      const buildPath = path.join(modPath, `./${buildDirName}`);
      if (modPath.includes('admin')) {
        fs.copySync(buildPath, `${outputDir}/admin`);
      } else {
        fs.copySync(buildPath, outputDir);
      }
    } else {
      process.exit(code);
    }
  });
});
