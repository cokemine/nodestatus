import type { HttpBindings } from '@hono/node-server';
import { setDefaultResultOrder } from 'node:dns';
import { createRequire } from 'node:module';
import path from 'node:path';
import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import { createServer as createViteServer } from 'vite';
import config from './lib/config';
import setup from './lib/setup';
import { logger } from './lib/utils';

setDefaultResultOrder('ipv6first');

const require = createRequire(import.meta.url);
let { port } = config;
async function createViteMiddleware(name: string, publicPath: string) {
  const vite = await createViteServer({
    root: path.dirname(require.resolve(`${name}/package.json`)),
    server: {
      hmr: {
        port: ++port,
      },
      middlewareMode: true,
    },
  });

  return createMiddleware<{ Bindings: HttpBindings }>(async (c, next) => {
    const url = c.req.path;
    if (url.startsWith('/api') || !url.startsWith(publicPath)) {
      return next();
    }
    return new Promise<void>((resolve) => {
      vite.middlewares(c.env.incoming, c.env.outgoing, () => {
        resolve(next());
      });
    });
  });
}

const app = new Hono<{ Bindings: HttpBindings }>();

const adminMiddleware = await createViteMiddleware('hotaru-admin', '/admin');
const webMiddleware = await createViteMiddleware(config.webTheme, '/');

app.use('*', adminMiddleware);
app.use('*', webMiddleware);

const [server, ipc] = await setup(app);

server.listen(config.port, () =>
  logger.info(`🎉  NodeStatus is listening on http://127.0.0.1:${config.port}`));

ipc
&& ipc.listen(config.ipcAddress, () =>
  logger.info(`🎉  NodeStatus Ipc is listening on ${config.ipcAddress}`));
