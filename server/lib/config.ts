import { program } from 'commander';
import { platform } from 'os';
import { resolve } from 'path';


program
  .option('-db, --database <db>', 'the path of database', platform() === 'win32' ? resolve(__dirname, '../db.sqlite') : '/usr/local/nodestatus/db.sqlite')
  .option('-p, --port <port>', 'the port of NodeStatus', '35601')
  .option('-i, --interval <interval>', 'update interval', '1500')
  .parse(process.argv);
const options = program.opts();

const config = {
  NODE_ENV: process.env.NODE_ENV,
  database: process.env.DATABASE || options.database,
  port: process.env.PORT || options.port,
  interval: process.env.INTERVAL || options.interval
};

export default config;
