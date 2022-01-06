const path = require('path');
const fs = require('fs-extra');
const { findModPath } = require('./utils');

const list = findModPath();

const outputDir = path.resolve(__dirname, '../packages/nodestatus-server/build/dist');

if (fs.pathExistsSync(outputDir)) {
  fs.removeSync(outputDir);
}

list.forEach(({ modPath, mod }) => {
  if (!mod.includes('theme') && !mod.includes('admin')) return;
  const buildDirName = fs.existsSync(`${modPath}/dist`) ? 'dist' : 'build';
  const buildPath = path.join(modPath, `./${buildDirName}`);
  fs.copySync(buildPath, `${outputDir}/${path.basename(modPath)}`);
});
