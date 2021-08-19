import Koa from 'koa';
import koaWebpack from 'koa-webpack';
import mount from 'koa-mount';
import { resolve } from 'path';
import { Server } from 'http';
import { createIO } from './lib/io';
import { logger } from './lib/utils';
import config from './lib/config';

const webpackMiddleware = async (name: string) => {
  const pkg = await import(`../web/${ name }/package.json`);
  if (pkg['devDependencies']['@vue/cli-service']) {
    process.env.VUE_CLI_CONTEXT = resolve(__dirname, `../web/${ name }`);
    return koaWebpack({
      config: require(`../web/${ name }/node_modules/@vue/cli-service/webpack.config`),
      devMiddleware: {
        publicPath: '/'
      }
    });
  }
  /* WIP */
  return null as any;
};

(async () => {
  const app = new Koa();
  const server = new Server(app.callback());

  app.use(mount('/', await webpackMiddleware('hotaru-theme')));

  await createIO(server);

  server.listen(config.port, () => logger.info(`🎉  NodeStatus is listening on http://localhost:${ config.port }`));
})();
