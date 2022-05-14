import { resolve } from 'path';
import historyApiFallback from 'koa2-connect-history-api-fallback';
import mount from 'koa-mount';
import serve from 'koa-static';
import Koa from 'koa';
import koaBody from 'koa-body';
import koaJwt from 'koa-jwt';
import config from '../server/lib/config';
import router from '../server/router';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const app = new Koa();

const frontendPath = resolve(__dirname, '../build/dist');

app.use(historyApiFallback({
  whiteList: ['/admin/assets'],
  rewrites: [
    { from: /^\/admin/ as any, to: '/admin/index.html' }
  ]
}));

app.use(mount('/admin', serve(resolve(frontendPath, './hotaru-admin'))));

app.use(async (ctx, next) => {
  if (ctx.path !== '/' && ctx.path !== '/index.html') {
    return next();
  }
  const { theme: themeQuery = '' } = ctx.query;
  let theme = '';
  if (!themeQuery || (themeQuery as string).startsWith('hotaru')) {
    theme = 'hotaru';
  } else if ((themeQuery as string).startsWith('classic')) {
    theme = 'classic';
  }
  switch (theme) {
    case 'hotaru':
      return serve(resolve(frontendPath, './hotaru-theme'))(ctx, next);
    case 'classic':
      return serve(resolve(frontendPath, './classic-theme'))(ctx, next);
    default:
      return ctx.throw(404, 'Theme Not Found');
  }
});

/* Fallback serving static files */
app.use(serve(resolve(frontendPath, './hotaru-theme')));
app.use(serve(resolve(frontendPath, './classic-theme')));

app.use(koaBody());
app.use(
  koaJwt({
    secret: config.webSecret
  }).unless({
    path: /^\/api\/session/
  })
);
app.use(router.routes());
app.use(router.allowedMethods());

export default (req: VercelRequest, res: VercelResponse) => {
  app.callback()(req, res);
};
