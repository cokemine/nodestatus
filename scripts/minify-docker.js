/*
* From https://raw.githubusercontent.com/DIYgod/RSSHub/master/scripts/docker/minify-docker.js under MIT License
*/
const path = require('path');
const fs = require('fs-extra');
const { nodeFileTrace } = require('@vercel/nft');
const resolve = p => path.resolve(__dirname, p);
const files = [ resolve('../packages/nodestatus-server/build/app.js') ];
const resultFolder = path.resolve(__dirname, '../app-minimal');

(async () => {
  console.log('Start analyzing...');
  fs.removeSync(resultFolder);
  const { fileList } = await nodeFileTrace(files, {
    base: path.resolve(__dirname, '../'),
  });
  console.log('Total files need to be copy: ' + fileList.length);
  return Promise.all(fileList.map((e) => fs.copy(e, path.resolve(resultFolder, e))));
})();
