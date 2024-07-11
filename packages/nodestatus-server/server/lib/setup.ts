import { Server } from 'http';
import fs from 'fs';
import Koa from 'koa';
import koaJwt from 'koa-jwt';
import { koaBody } from 'koa-body';
import router from '../router';
import { usePush, useEvent, useIpc } from '../plugin';
import NodeStatus from './core';
import config from './config';
import type { Server as NetServer } from 'net';

export default async function setup(app: Koa): Promise<[Server, NetServer | null]> {
  const server = new Server(app.callback());
  let ipc = null;

  const instance = new NodeStatus(server, {
    interval: config.interval,
    pingInterval: config.pingInterval,
    reconnectTimeout: config.reconnectTimeout
  });

  await instance.launch();

  if (config.usePush) {
    setTimeout(
      () => usePush(instance, {
        ...config.telegram,
        chat_id: config.telegram.chat_id.split(',')
      }),
      config.pushDelay * 1000
    );
  }

  if (config.useEvent) {
    // @TODO: ESLint
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEvent(instance);
  }

  if (config.useIpc) {
    fs.existsSync(config.ipcAddress) && fs.unlinkSync(config.ipcAddress);
    // @TODO: ESLint
    // eslint-disable-next-line react-hooks/rules-of-hooks
    ipc = useIpc();
  }

  if (config.useWeb) {
    app.use(koaBody());
    app.use(
      koaJwt({
        secret: config.webSecret
      }).unless({
        path: [/^\/api\/session/, /^\/telegraf/, /^\/api\/config/]
      })
    );
    app.use(router.routes());
    app.use(router.allowedMethods());
  }
  return [server, ipc];
}
