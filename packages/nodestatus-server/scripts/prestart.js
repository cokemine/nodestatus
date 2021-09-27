/* Initializing database for Docker */
const cp = require('child_process');
const { resolve, dirname } = require('path');
const fs = require('fs');

if (process.env.IS_DOCKER === 'true') {
  let dbPath = process.env.DATABASE || '/usr/local/NodeStatus/server/db.sqlite';
  fs.mkdirSync(dirname(dbPath), { recursive: true });
  cp.spawn('prisma', [ 'db', 'push', '--accept-data-loss', '--skip-generate' ], {
    env: { BINARY_TARGETS: '["native"]', DATABASE_URL: `file:${dbPath}`, ...process.env },
    cwd: resolve(__dirname, '../'),
    stdio: 'inherit'
  });
}
