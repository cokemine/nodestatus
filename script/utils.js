const fs = require('fs');
const os = require('os');
const resolve = require('path').resolve;
const libDir = resolve(__dirname, '../web');

function findModPath() {
  const lib = fs.readdirSync(libDir);
  const list = [];
  for (const mod of lib) {
    const modPath = resolve(libDir, mod);

    const exist = fileName => {
      return fs.existsSync(resolve(modPath, fileName));
    };

    if (!exist('package.json')) {
      continue;
    }

    let cmd = exist('yarn.lock') ? 'yarn' : 'npm';

    os.platform().startsWith('win') && (cmd += '.cmd');

    list.push({ modPath, cmd });
  }

  return list;
}

module.exports = {
  findModPath
};
