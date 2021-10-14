const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const { homedir, platform } = require('os');
const { resolve } = require('path');
const dotenv = require('dotenv');
const { backupDatabase } = require('./utils');

dotenv.config({ path: path.resolve(homedir(), '.nodestatus/.env.local') });

const dbPath = process.env.DATABASE || (
  platform() === 'win32'
    ? resolve(homedir(), '.nodestatus/db.sqlite')
    : '/usr/local/NodeStatus/server/db.sqlite'
);

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
fs.existsSync(dbPath) && backupDatabase(dbPath);
let cmd = 'prisma';
platform() === 'win32' && (cmd += '.cmd');
const prisma = cp.spawn(cmd, ['db', 'push', '--accept-data-loss'], {
  env: { BINARY_TARGETS: '["native"]', DATABASE_URL: `file:${dbPath}`, ...process.env },
  cwd: resolve(__dirname, '../'),
  stdio: 'inherit'
});
prisma.on('close', code => {
  if (code) {
    console.log('Something wrong while updating database schema.');
    process.exit(1);
  } else {
    console.log(`Database file location: ${dbPath}`);
  }
});
