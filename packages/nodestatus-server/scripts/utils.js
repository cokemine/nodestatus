const fs = require('fs');
const { platform, homedir } = require('os');
const { resolve } = require('path');
const path = require('path');
const cp = require('child_process');
const replace = require('replace-in-file');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(homedir(), '.nodestatus/.env.local') });

function backupDatabase(dbPath) {
  if (!fs.existsSync(dbPath)) return;
  console.log('The database file is detected to already exist.');
  console.log('Trying to update database schema.....');
  const date = new Date();
  fs.copyFileSync(
    dbPath,
    `${dbPath}_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}_${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}.bak`
  );
}

function checkDatabaseType() {
  const dbPath = process.env.DATABASE || '';
  if (dbPath.includes('mysql:')) {
    return 'mysql';
  }
  if (dbPath.includes('postgresql:')) {
    return 'postgresql';
  }
  return 'sqlite';
}

const databaseType = checkDatabaseType();

function initDatabase() {
  const dbPath = process.env.DATABASE || (
    platform() === 'win32'
      ? `file:${resolve(homedir(), '.nodestatus/db.sqlite')}`
      : 'file:/usr/local/NodeStatus/server/db.sqlite'
  );
  const envOption = { BINARY_TARGETS: '["native"]', ...process.env };

  /* backup database if is sqlite */
  if (databaseType === 'sqlite') {
    envOption.DATABASE_URL = dbPath.includes('file:') ? dbPath : `file:${dbPath}`;
    backupDatabase(dbPath.replace('file:', ''));
  } else {
    envOption.DATABASE_URL = dbPath;
  }

  /* Replace provider since prisma dropped provider array notation support */
  replace.sync({
    files: path.resolve(__dirname, '../prisma/schema.prisma'),
    from: /provider = "\w+"/,
    to: `provider = "${databaseType}"`
  });

  let cmd = 'prisma';
  platform() === 'win32' && (cmd += '.cmd');

  /* Regenerate correct prisma client */
  const prisma = cp.spawn(cmd, ['db', 'push', '--accept-data-loss'], {
    env: envOption,
    cwd: resolve(__dirname, '../'),
    stdio: 'inherit'
  });

  prisma.on('close', code => {
    if (code) {
      console.log('Something wrong while updating database schema.');
      process.exit(code);
    } else {
      console.log(`Database file location: ${dbPath}`);
    }
  });
}

module.exports = {
  initDatabase
};
