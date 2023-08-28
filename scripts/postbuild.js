import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { findModPath } from './utils.js';

const list = findModPath();

const __dirname = dirname(fileURLToPath(import.meta.url));

const outputDir = path.resolve(__dirname, '../packages/nodestatus-server/build/dist');

if (fs.pathExistsSync(outputDir)) {
  fs.removeSync(outputDir);
}

list.forEach(({ modPath, mod }) => {
  if (!mod.includes('theme') && !mod.includes('admin')) return;
  const buildPath = path.join(modPath, './dist');
  if (!fs.existsSync(buildPath)) return;
  fs.copySync(buildPath, `${outputDir}/${path.basename(modPath)}`);
});
