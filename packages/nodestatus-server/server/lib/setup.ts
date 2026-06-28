import type { Hono } from 'hono';
import type { Server as NetServer } from 'node:net';
import fs from 'node:fs';
import { Server } from 'node:http';
import { getRequestListener } from '@hono/node-server';
import { jwt } from 'hono/jwt';
import { useEvent, useIpc, usePush } from '../plugin';
import { adminApi, webApi } from '../router';
import config from './config';
import NodeStatus from './core';

export default async function setup(app: Hono): Promise<[Server, NetServer | null]> {
  const server = new Server(getRequestListener(app.fetch));
  let ipc = null;

  const instance = new NodeStatus(server, {
    interval: config.interval,
    pingInterval: config.pingInterval,
    reconnectTimeout: config.reconnectTimeout,
  });

  await instance.launch();

  if (config.usePush) {
    setTimeout(
      () => usePush(instance, {
        ...config.telegram,
        chat_id: config.telegram.chat_id.split(','),
      }),
      config.pushDelay * 1000,
    );
  }

  if (config.useEvent) {
    // @TODO: ESLint
    useEvent(instance);
  }

  if (config.useIpc) {
    fs.existsSync(config.ipcAddress) && fs.unlinkSync(config.ipcAddress);
    // @TODO: ESLint
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
