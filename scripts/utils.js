import fs from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const libDir = resolve(__dirname, '../web');

export function findModPath() {
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
