import { program } from 'commander';
import { platform } from 'os';
import { resolve } from 'path';
import { logger } from './utils';


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

if (isNaN(parseInt(config.port))) {
  logger.fatal('Please enter the correct port number.');
  process.exit(1);
}

if (isNaN(parseInt(config.interval))) {
  logger.fatal('Please enter the correct interval.');
  process.exit(1);
}

export default config;
