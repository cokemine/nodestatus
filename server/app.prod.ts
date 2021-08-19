import Koa from 'koa';
import serve from 'koa-static';
import { resolve } from 'path';
import { logger } from './lib/utils';
import { Server } from 'http';
import { createIO } from './lib/io';
import config from './lib/config';


(async () => {
  const app = new Koa();

  app.use(serve(resolve(__dirname, '../web/hotaru-theme/dist'), {
    maxage: 2592000
  }));

  const server = new Server(app.callback());

  await createIO(server);

  server.listen(config.port, () => logger.info(`🎉  NodeStatus is listening on http://127.0.0.1:${ config.port }`));
})();

