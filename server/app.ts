import { platform } from 'os';
import { mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { program } from 'commander';

program
  .option('-db, --database <db>', 'the path of database', platform() === 'win32' ? resolve(__dirname, '../db.sqlite') : '/usr/local/nodestatus/db.sqlite')
  .option('-p, --port <port>', 'the port of NodeStatus', '35601')
  .option('-i, --interval <interval>', 'update interval', '1500')
  .parse(process.argv);

const options = program.opts();
process.env.db = options.database;
process.env.port = options.port;
process.env.interval = options.interval;

mkdirSync(dirname(options.database), { recursive: true });

import db from './lib/db';

db.sync({ alter: true }).then(() =>
  process.env.NODE_ENV === 'development'
    ? require('./lib/app.dev')
    : require('./lib/app.prod')
);
