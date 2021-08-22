import Koa from 'koa';
import koaWebpack from 'koa-webpack';
import mount from 'koa-mount';
import { resolve } from 'path';
import { createStatus } from './lib/status';
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

  app.use(mount('/', await webpackMiddleware('hotaru-theme')));

  const [server, ipc] = await createStatus(app);

  server.listen(config.port, () => logger.info(`🎉  NodeStatus is listening on http://127.0.0.1:${ config.port }`));

  ipc && ipc.listen(config.ipcAddress, () => logger.info(`🎉  NodeStatus Ipc is listening on ${ config.ipcAddress }`));
})();
