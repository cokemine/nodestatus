import { Server } from 'http';
import fs from 'fs';
import Koa from 'koa';
import koaJwt from 'koa-jwt';
import koaBody from 'koa-body';
import router from '../router';
import NodeStatus from './nodestatus';
import createIpc from './ipc';
import createPush from './push';
import config from './config';
import type { Server as NetServer } from 'net';

export async function createStatus(app: Koa): Promise<[Server, NetServer | null]> {
  const server = new Server(app.callback());
  let ipc = null;

  const instance = new NodeStatus(server, {
    interval: config.interval,
    pingInterval: config.pingInterval
  });

  await instance.launch();

  if (config.usePush) {
    setTimeout(
      createPush.bind(instance, {
        pushTimeOut: config.pushTimeOut,
        telegram: {
          ...config.telegram,
          chat_id: config.telegram.chat_id.split(',')
        }
      }),
      config.pushDelay * 1000
    );
  }

  if (config.useIpc) {
    fs.existsSync(config.ipcAddress) && fs.unlinkSync(config.ipcAddress);
    ipc = createIpc();
  }
  if (config.useWeb) {
    app.use(koaBody());
    app.use(
      koaJwt({
        secret: config.webSecret
      }).unless({
        path: [/^\/api\/session/, /^\/telegraf/]
      })
    );
    app.use(router.routes());
    app.use(router.allowedMethods());
  }
  return [server, ipc];
}
