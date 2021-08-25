import dotenv from 'dotenv';
import { program } from 'commander';
import { platform } from 'os';
import { resolve } from 'path';
import { logger } from './utils';

dotenv.config();

program
  .option('-db, --database <db>', 'the path of database', platform() === 'win32' ? resolve(__dirname, '../db.sqlite') : '/usr/local/NodeStatus/server/db.sqlite')
  .option('-p, --port <port>', 'the port of NodeStatus', '35601')
  .option('-i, --interval <interval>', 'update interval', '1500')
  .parse(process.argv);
const options = program.opts();

const config = {
  NODE_ENV: process.env.NODE_ENV,
  database: process.env.DATABASE || options.database,
  port: process.env.PORT || options.port,
  interval: process.env.INTERVAL || options.interval,
  useIpc: process.env.USE_IPC || 'true',
  ipcAddress: process.env.IPC_ADDRESS || (platform() !== 'win32' ? '/tmp/status_unix.sock' : '\\\\.\\pipe\\status_ipc'),
  usePush: process.env.USE_PUSH || 'true',
  telegram: {
    proxy: process.env.TGBOT_PROXY,
    bot_token: process.env.TGBOT_TOKEN || '',
    chat_id: process.env.TGBOT_CHATID || '',
    web_hook: process.env.TGBOT_WEBHOOK
  }
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
