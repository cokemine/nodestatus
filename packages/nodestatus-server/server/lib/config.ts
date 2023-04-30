import { platform, homedir } from 'os';
import { resolve } from 'path';
import dotenv from 'dotenv';
import { Command, createOption } from '@commander-js/extra-typings';

if (process.env.NODE_ENV !== 'TEST') {
  dotenv.config({ path: resolve(homedir(), '.nodestatus/.env.local') });
} else {
  process.env.DATABASE = process.env.DATABASE ? process.env.DATABASE : resolve(__dirname, '../../db.test.sqlite');
}

const program = new Command('NodeStatus')
  .addOption(createOption('-p, --port <port>', 'Web server listening port').env('PORT').default(35601).argParser(value => parseInt(value, 10)))
  .addOption(createOption('-i, --interval <interval>', 'Update interval').env('INTERVAL').default(1500).argParser(value => parseInt(value, 10)))
  .addOption(createOption('-v, --verbose', 'Verbose mode').env('VERBOSE').default(false))
  .addOption(createOption('-pi, --ping-interval <pingInterval>', 'Ping interval').env('PING_INTERVAL').default(30).argParser(value => parseInt(value, 10)))

  .addOption(createOption('-ipc, --use-ipc', 'Use IPC').env('USE_IPC').default(true))
  .addOption(createOption('-web, --use-web', 'Use Web').env('USE_WEB').default(true))
  .addOption(createOption('-push, --use-push', 'Use Push').env('USE_PUSH').default(true))

  .addOption(createOption('-wt, --web-theme <webTheme>', 'Web theme').env('WEB_THEME').env('THEME').default('hotaru-theme'))
  .addOption(createOption('-wmt, --web-title <webTitle>', 'Web title').env('WEB_TITLE').default('Server Status'))
  .addOption(createOption('-wst, --web-subtitle <webSubtitle>', 'Web subtitle').env('WEB_SUBTITLE').default('Servers\' Probes Set up with NodeStatus'))
  .addOption(createOption('-wht, --web-headtitle <webHeadtitle>', 'Web head title').env('WEB_HEADTITLE').default('NodeStatus'))

  .addOption(createOption('-wu, --web-username <webUsername>', 'Web username').env('WEB_USERNAME').default('admin'))
  .addOption(createOption('-wp, --web-password <webPassword>', 'Web password').env('WEB_PASSWORD').default(''))
  .addOption(createOption('-ws, --web-secret <webSecret>', 'Web jwt secret').env('WEB_SECRET').default('node-secret').argParser(val => val || 'node-secret'))

  .addOption(
    createOption('-ia, --ipc-address <ipcAddress>', 'IPC address')
      .env('IPC_ADDRESS').default(
        platform() !== 'win32'
          ? '/tmp/status_unix.sock'
          : '\\\\.\\pipe\\status_ipc'
      )
  )

  .addOption(createOption('-pt, --push-timeout <pushTimeout>', 'Push timeout').env('PUSH_TIMEOUT').default(120).argParser(value => parseInt(value, 10)))
  .addOption(createOption('-pd, --push-delay <pushDelay>', 'Push delay').env('PUSH_DELAY').default(15).argParser(value => parseInt(value, 10)))

  .addOption(createOption('-ti, --telegram-bot-token <telegramBotToken>', 'Telegram bot token').env('TGBOT_TOKEN').default(''))
  .addOption(createOption('-tc, --telegram-chat-id <telegramChatId>', 'Telegram chat id').env('TGBOT_CHATID').default(''))
  .addOption(createOption('-tp, --telegram-proxy <telegramProxy>', 'Telegram proxy').env('TGBOT_PROXY'))
  .addOption(createOption('-tw, --telegram-web-hook <telegramWebHook>', 'Telegram web hook').env('TGBOT_WEBHOOK'))
  .parse(process.argv);
const options = program.opts();

let database = process.env.DATABASE || (
  platform() === 'win32'
    ? `file:${resolve(homedir(), '.nodestatus/db.sqlite')}`
    : 'file:/usr/local/NodeStatus/server/db.sqlite'
);

if (!(database.includes('file:') || database.includes('mysql:') || database.includes('postgresql:'))) {
  database = `file:${database}`;
}

const config = {
  ...options,
  NODE_ENV: process.env.NODE_ENV,
  telegram: {
    proxy: options.telegramProxy,
    bot_token: options.telegramBotToken,
    chat_id: options.telegramChatId,
    web_hook: options.telegramWebHook
  },
  database
};

export default config;
