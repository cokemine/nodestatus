import path from 'path';
import { createServer as createViteServer } from 'vite';
import Koa, { Middleware } from 'koa';
import historyApiFallback from 'koa2-connect-history-api-fallback';
import c2k from 'koa-connect';
import { createStatus } from './lib/status';
import { logger } from './lib/utils';
import config from './lib/config';

const middlewares: Record<string, Middleware> = {};
const webs = [{ name: config.webTheme, publicPath: '/' }, { name: 'hotaru-admin', publicPath: '/admin' }];

let { port } = config;
const createMiddleware = async (name: string, publicPath: string): Promise<Middleware> => {
  const vite = await createViteServer({
    root: path.dirname(require.resolve(`${name}/package.json`)),
    server: {
      hmr: {
        port: ++port
      },
      middlewareMode: 'html'
    }
  });

  return async (ctx, next) => {
    const { url } = ctx;
    if (url.startsWith('/api') || !url.startsWith(publicPath)) {
      await next();
    } else {
      await c2k(vite.middlewares)(ctx, next);
    }
  };
};

(async () => {
  const app = new Koa();

  await Promise.all(webs.map(async ({
    name,
    publicPath
  }) => middlewares[name] = await createMiddleware(name, publicPath)));

  app.use(middlewares['hotaru-admin']);
  app.use(middlewares[config.webTheme]);

  app.use(historyApiFallback({
    whiteList: ['/admin/assets', '/telegraf'],
    rewrites: [
      { from: /^\/admin/ as any, to: '/admin/index.html' }
    ]
  }));

  const [server, ipc] = await createStatus(app);

  server.listen(config.port, () => logger.info(`🎉  NodeStatus is listening on http://127.0.0.1:${config.port}`));

  ipc && ipc.listen(config.ipcAddress, () => logger.info(`🎉  NodeStatus Ipc is listening on ${config.ipcAddress}`));
})();
