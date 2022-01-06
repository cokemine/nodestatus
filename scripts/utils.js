const fs = require('fs');
const os = require('os');
const { resolve } = require('path');

const libDir = resolve(__dirname, '../web');

function findModPath() {
  try {
    const lib = fs.readdirSync(libDir);
    const list = [];
    for (const mod of lib) {
      const modPath = resolve(libDir, mod);
      const exist = fileName => fs.existsSync(resolve(modPath, fileName));

      if (!exist('package.json')) {
        continue;
      }

      list.push({ modPath, mod });
    }

    return list;
  } catch (e) {
    return [];
  }
}

module.exports = {
  findModPath
};
