const fs = require('fs');
const path = require('path');
const { homedir, platform } = require('os');
const { resolve } = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(homedir(), '.nodestatus/.env.local') });

let dbPath = process.env.DATABASE || (
  platform() === 'win32'
    ? resolve(homedir(), '.nodestatus/db.sqlite')
    : '/usr/local/NodeStatus/server/db.sqlite'
);

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
fs.copyFileSync(path.resolve(__dirname, '../db.base.sqlite'), dbPath, fs.constants.COPYFILE_EXCL);

console.log(`Database file location: ${dbPath}`);
