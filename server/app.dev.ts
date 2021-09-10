import Koa, { Middleware } from 'koa';
import koaWebpack from 'koa-webpack';
import historyApiFallback from 'koa2-connect-history-api-fallback';
import { resolve } from 'path';

import { createStatus } from './lib/status';
import { logger } from './lib/utils';
import config from './lib/config';
import db from './lib/db';

const middlewares: Record<string, Middleware> = {};
const webs = [{ name: 'hotaru-theme', publicPath: '/' }, { name: 'hotaru-admin', publicPath: '/admin' }];

/* 或许需要一个更好的 dev 前端方案... */
const webpackMiddleware = async (name: string, publicPath: string) => {
  const pkg = await import(`../web/${ name }/package.json`);
  let middleware: Middleware;
  if (pkg['devDependencies']['@vue/cli-service']) {
    process.env.VUE_CLI_CONTEXT = resolve(__dirname, `../web/${ name }`);
    middleware = await koaWebpack({
      config: require(`../web/${ name }/node_modules/@vue/cli-service/webpack.config`),
      devMiddleware: {
        publicPath,
      }
    });
    middlewares[name] = middleware;
  }
  if (pkg['devDependencies']['@craco/craco']) {
    /*eslint-disable @typescript-eslint/no-var-requires */
    const { createWebpackDevConfig } = require(`../web/${ name }/node_modules/@craco/craco`);
    const cracoConfig = require(`../web/${ name }/craco.config`);
    cracoConfig.webpack = {
      ...cracoConfig.webpack,
      plugins: {
        remove: ['HotModuleReplacementPlugin']
      },
    };
    process.chdir(`./web/${ name }`);
    process.env.PUBLIC_URL = publicPath;
    const config = createWebpackDevConfig({
      ...cracoConfig,
      reactScriptsVersion: resolve(__dirname, `../web/${ name }/node_modules/react-scripts`)
    });
    process.chdir('../../');
    middleware = await koaWebpack({
      config,
      devMiddleware: {
        publicPath,
      }
    });
    middlewares[name] = middleware;
  }
};


(async () => {
  await db.sync({ alter: true });
  const app = new Koa();
  await Promise.all(webs.map(({
    name,
    publicPath
  }) => webpackMiddleware(name, publicPath)));

  app.use(historyApiFallback({
    whiteList: ['/admin/static', '/telegraf'],
    rewrites: [
      { from: /^\/admin/ as any, to: '/admin/index.html' }
    ]
  }));
  app.use(middlewares['hotaru-theme']);
  app.use(middlewares['hotaru-admin']);

  const [server, ipc] = await createStatus(app);

  server.listen(config.port, () => logger.info(`🎉  NodeStatus is listening on http://127.0.0.1:${ config.port }`));

  ipc && ipc.listen(config.ipcAddress, () => logger.info(`🎉  NodeStatus Ipc is listening on ${ config.ipcAddress }`));
})();
