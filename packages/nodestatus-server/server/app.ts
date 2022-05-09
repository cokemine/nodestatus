import { resolve } from 'path';
import Koa from 'koa';
import serve from 'koa-static';
import mount from 'koa-mount';
import historyApiFallback from 'koa2-connect-history-api-fallback';
import { logger } from './lib/utils';
import { createStatus } from './lib/status';
import config from './lib/config';

if (!config.port) {
  logger.fatal('No port specified');
  process.exit(1);
}
if (config.useWeb && !config.webPassword) {
  logger.fatal('No web password specified');
  process.exit(1);
}

(async () => {
  const app = new Koa();

  app.use(historyApiFallback({
    whiteList: ['/admin/assets', '/telegraf'],
    rewrites: [
      { from: /^\/admin/ as any, to: '/admin/index.html' }
    ]
  }));

  app.use(mount('/admin', serve(resolve(__dirname, './dist/hotaru-admin'), { maxage: 2592000 })));
  app.use(serve(resolve(__dirname, `./dist/${config.theme}`), { maxage: 2592000 }));

  const [server, ipc] = await createStatus(app);

  server.listen(config.port, () => logger.info(`🎉  NodeStatus is listening on http://127.0.0.1:${config.port}`));

  ipc && ipc.listen(config.ipcAddress, () => logger.info(`🎉  NodeStatus Ipc is listening on ${config.ipcAddress}`));
})();
