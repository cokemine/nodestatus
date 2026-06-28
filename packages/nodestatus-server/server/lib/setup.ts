import { Server } from 'http';
import fs from 'fs';
import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import { getRequestListener } from '@hono/node-server';
import { adminApi, webApi } from '../router';
import { usePush, useEvent, useIpc } from '../plugin';
import NodeStatus from './core';
import config from './config';
import type { Server as NetServer } from 'net';

export default async function setup(app: Hono): Promise<[Server, NetServer | null]> {
  const server = new Server(getRequestListener(app.fetch));
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
    app.use('/api/admin/*', async (c, next) => {
      const path = c.req.path;
      if (path === '/api/admin/session') {
        return next();
      }
      const middleware = jwt({ secret: config.webSecret, alg: 'HS256' });
      return middleware(c, next);
    });
    app.route('/api/admin', adminApi);
    app.route('/api', webApi);
  }
  return [server, ipc];
}
