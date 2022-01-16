import { platform, homedir } from 'os';
import { resolve } from 'path';
import dotenv from 'dotenv';
import { program } from 'commander';
import { logger } from './utils';

if (process.env.NODE_ENV !== 'TEST') {
  dotenv.config({ path: resolve(homedir(), '.nodestatus/.env.local') });
}

program
  .option('-db, --database <db>', 'the path of database', platform() === 'win32' ? `file:${resolve(homedir(), '.nodestatus/db.sqlite')}` : 'file:/usr/local/NodeStatus/server/db.sqlite')
  .option('-p, --port <port>', 'the port of NodeStatus', '35601')
  .option('-i, --interval <interval>', 'update interval', '1500')
  .parse(process.argv);
const options = program.opts();

let database = process.env.DATABASE || (
  process.env.NODE_ENV === 'TEST'
    ? resolve(__dirname, '../../db.test.sqlite')
    : options.database
);

if (!(database.includes('file:') || database.includes('mysql:') || database.includes('postgresql:'))) {
  database = `file:${database}`;
}

const config = {
  NODE_ENV: process.env.NODE_ENV,
  database,
  port: Number(process.env.PORT || options.port),
  interval: Number(process.env.INTERVAL || options.interval),
  verbose: process.env.VERBOSE === 'true',
  theme: process.env.THEME || 'hotaru-theme',

  useIpc: process.env.USE_IPC !== 'false',
  useWeb: process.env.USE_WEB !== 'false',
  usePush: process.env.USE_PUSH !== 'false',

  webUsername: process.env.WEB_USERNAME || 'admin',
  webPassword: process.env.WEB_PASSWORD || '',
  webSecret: process.env.WEB_SECRET || process.env.WEB_PASSWORD || 'secret',

  ipcAddress: process.env.IPC_ADDRESS || (platform() !== 'win32' ? '/tmp/status_unix.sock' : '\\\\.\\pipe\\status_ipc'),

  pushTimeOut: Number(process.env.PUSH_TIMEOUT) || 30,
  pushDelay: Number(process.env.PUSH_DELAY) || 15,

  telegram: {
    proxy: process.env.TGBOT_PROXY,
    bot_token: process.env.TGBOT_TOKEN || '',
    chat_id: process.env.TGBOT_CHATID || '',
    web_hook: process.env.TGBOT_WEBHOOK
  }
};

if (Number.isNaN(config.port)) {
  logger.fatal('Please enter the correct port number.');
  process.exit(1);
}

if (Number.isNaN(config.interval)) {
  logger.fatal('Please enter the correct interval.');
  process.exit(1);
}

export default config;
