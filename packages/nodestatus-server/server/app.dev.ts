import path from 'path';
import { createServer as createViteServer } from 'vite';
import Koa, { Middleware } from 'koa';
import historyApiFallback from 'koa2-connect-history-api-fallback';
import c2k from 'koa-connect';
import compose from 'koa-compose';
import mount from 'koa-mount';
import { createStatus } from './lib/status';
import { logger } from './lib/utils';
import config from './lib/config';

const webs = [{ name: 'hotaru-admin', publicPath: '/admin' }, { name: 'hotaru-theme', publicPath: '/' }];

const createMiddleware = async (name: string): Promise<Middleware> => {
  const vite = await createViteServer({
    root: path.dirname(require.resolve(`${name}/package.json`)),
    server: {
      middlewareMode: 'html'
    },
  });
  const middleware: Middleware = async (ctx, next) => {
    try {
      await next();
    } catch (e: any) {
      ctx.status = 500;
      vite.ssrFixStacktrace(e);
      ctx.body = e.message;
    }
  };
  return async (ctx, next) => {
    const { url } = ctx;
    if (url.startsWith('/api')) {
      await next();
    } else {
      await compose([middleware, c2k(vite.middlewares)])(ctx, next);
    }
  };
};

(async () => {
  const app = new Koa();

  await Promise.all(webs.map(async ({ name, publicPath }) => {
    const middleware = await createMiddleware(name);
    app.use(mount(publicPath, middleware));
  }));

  app.use(historyApiFallback({
    whiteList: ['/admin/static', '/telegraf'],
    rewrites: [
      { from: /^\/admin/ as any, to: '/admin/index.html' }
    ]
  }));

  const [server, ipc] = await createStatus(app);

  server.listen(config.port, () => logger.info(`🎉  NodeStatus is listening on http://127.0.0.1:${config.port}`));

  ipc && ipc.listen(config.ipcAddress, () => logger.info(`🎉  NodeStatus Ipc is listening on ${config.ipcAddress}`));
})();
