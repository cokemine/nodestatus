import { Server } from 'http';
import type { Server as NetServer } from 'net';
import createIpc from './ipc';
import Koa from 'koa';
import { NodeStatus } from './nodestatus';
import config from './config';
import fs from 'fs';

export async function createStatus(app: Koa): Promise<[Server, NetServer | null]> {

  const server = new Server(app.callback());
  let ipc = null;

  const instance = new NodeStatus(server, {
    interval: Number(config.interval),
    usePush: config.usePush === 'true',
    telegram: {
      ...config.telegram,
      chat_id: config.telegram.chat_id.split(',')
    }
  });

  await instance.launch();

  if (config.useIpc) {
    fs.existsSync(config.ipcAddress) && fs.unlinkSync(config.ipcAddress);
    ipc = createIpc(instance);
  }

  return [server, ipc];
}
