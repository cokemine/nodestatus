import Koa from 'koa';
import koaWebpack from 'koa-webpack';
import mount from 'koa-mount';
import { resolve } from 'path';
import { Server } from 'http';
import { createIO } from './io';
import { logger } from './utils';

const getVueWebpackConfig = (name: string) => {
  process.env.VUE_CLI_CONTEXT = resolve(__dirname, `../../web/${ name }`);
  return require(`../../web/${ name }/node_modules/@vue/cli-service/webpack.config`);
};

(async () => {
  const app = new Koa();
  const server = new Server(app.callback());

  app.use(mount('/', await koaWebpack({
    config: getVueWebpackConfig('hotaru-theme'),
    devMiddleware: {
      publicPath: '/'
    }
  })));

  await createIO(server);

  server.listen(process.env.port, () => logger.info(`🎉  NodeStatus is listening on http://localhost:${ process.env.port }`));
})();
