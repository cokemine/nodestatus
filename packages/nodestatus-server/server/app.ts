import { setDefaultResultOrder } from 'node:dns';
import fs from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import config from './lib/config';
import setup from './lib/setup';
import { logger } from './lib/utils';

// https://github.com/telegraf/telegraf/issues/1961
setDefaultResultOrder('ipv6first');

const __dirname = dirname(fileURLToPath(import.meta.url));

if (!config.port) {
  logger.fatal('No port specified');
  process.exit(1);
}
if (config.useWeb && !config.webPassword) {
  logger.fatal('No web password specified');
  process.exit(1);
}

const app = new Hono();

// Redirect /admin to /admin/
app.get('/admin', c => c.redirect('/admin/'));

// Serve admin static files (SPA)
app.use(
  '/admin/*',
  serveStatic({
    root: resolve(__dirname, './dist/hotaru-admin'),
    rewriteRequestPath: p => p.replace(/^\/admin/, ''),
  }),
);

// Fallback for admin pages (history routing)
app.get('/admin/*', async (c) => {
  try {
    const html = await fs.promises.readFile(resolve(__dirname, './dist/hotaru-admin/index.html'), 'utf-8');
    return c.html(html);
  }
  catch {
    return c.text('Not Found', 404);
  }
});

// Serve frontend static files
app.use(
  '/*',
  serveStatic({
    root: resolve(__dirname, `./dist/${config.webTheme}`),
  }),
);

const [server, ipc] = await setup(app);

server.listen(config.port, () => logger.info(`🎉  NodeStatus is listening on http://127.0.0.1:${config.port}`));

ipc && ipc.listen(config.ipcAddress, () => logger.info(`🎉  NodeStatus Ipc is listening on ${config.ipcAddress}`));
