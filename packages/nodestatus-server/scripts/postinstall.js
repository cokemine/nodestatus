const cp = require('child_process');
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

try {
  if (fs.existsSync(dbPath)) {
    console.log('The database file is detected to already exist.');
    console.log('Trying to update database schema.....');
    fs.copyFileSync(dbPath, dbPath + `${new Date().getTime()}.bak`);
    fs.copyFileSync(dbPath, resolve(__dirname, '../db.base.sqlite'));
  }
  let cmd = 'prisma';
  platform() === 'win32' && (cmd += '.cmd');
  const prisma = cp.spawn(cmd, [ 'db', 'push', '--accept-data-loss' ], {
    env: { ...process.env, 'BINARY_TARGETS': '["native"]' },
    cwd: resolve(__dirname, '../'),
    stdio: 'inherit'
  });
  prisma.on('close', code => {
    if (code) {
      console.log('Something wrong while updating database schema.');
      process.exit(1);
    } else {
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
      fs.copyFileSync(path.resolve(__dirname, '../db.base.sqlite'), dbPath);
      console.log(`Database file location: ${dbPath}`);
    }
  });
} catch (err) {
  console.log(`[ERROR]: ${err.message}`);
  process.exit(1);
}
