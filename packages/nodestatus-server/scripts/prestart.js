/* Initializing database for Docker */
const cp = require('child_process');
const { resolve, dirname } = require('path');
const { homedir, platform } = require('os');
const fs = require('fs');

if (process.env.IS_DOCKER === 'true') {
  let dbPath = process.env.DATABASE || (
    platform() === 'win32'
      ? resolve(homedir(), '.nodestatus/db.sqlite')
      : '/usr/local/NodeStatus/server/db.sqlite'
  );
  fs.mkdirSync(dirname(dbPath), { recursive: true });
  cp.spawn('prisma', [ 'db', 'push', '--accept-data-loss', '--skip-generate' ], {
    env: { BINARY_TARGETS: '["native"]', DATABASE_URL: `file:${dbPath}`, ...process.env },
    cwd: resolve(__dirname, '../'),
    stdio: 'inherit'
  });
}
