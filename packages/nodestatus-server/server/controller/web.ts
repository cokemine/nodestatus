import { Context, Middleware } from 'koa';
import {
  getListServers,
  setServer as _setServer,
  createServer as _addServer,
  bulkCreateServer,
  delServer as _delServer,
} from '../model/server';
import { IServer, IResp, BoxItem } from '../../types/server';
import { createRes } from '../lib/utils';

const handleRequest = async (ctx: Context, handler: Promise<IResp>): Promise<void> => {
  const result = await handler;
  if (result.code) {
    ctx.status = 500;
  }
  ctx.body = result;
};

const listServers: Middleware = async ctx => {
  const result = await getListServers();

  (result as BoxItem[]).sort((x, y) => y.order - x.order);

  await handleRequest(ctx, Promise.resolve(result));
};

const setServer: Middleware = async ctx => {
  const { username } = ctx.request.body;
  const data: Partial<IServer> = ctx.request.body.data;
  if (!username || !data) {
    ctx.status = 400;
    ctx.body = createRes(1, 'Wrong request');
    return;
  }
  if (!data.password) delete data.password;
  if (username === data.username) delete data.username;
  await handleRequest(ctx, _setServer(username, data));
};

const addServer: Middleware = async ctx => {
  const data = ctx.request.body;
  if (!data) {
    ctx.status = 400;
    ctx.body = createRes(1, 'Wrong request');
    return;
  }
  if (Object.hasOwnProperty.call(data, 'data')) {
    try {
      const d = JSON.parse(data.data);
      await handleRequest(ctx, bulkCreateServer(d));
    } catch (error: any) {
      ctx.status = 400;
      ctx.body = createRes(1, 'Wrong request');
      return;
    }
  } else {
    await handleRequest(ctx, _addServer(data));
  }
};

const delServer: Middleware = async ctx => {
  const { username = '' } = ctx.params;
  if (!username) {
    ctx.status = 400;
    ctx.body = createRes(1, 'Wrong request');
    return;
  }
  await handleRequest(ctx, _delServer(username));
};

const modifyOrder: Middleware = async ctx => {
  const { order = '' } = ctx.request.body;
  if (!order) {
    ctx.status = 400;
    ctx.body = createRes(1, 'Wrong request');
    return;
  }
  await handleRequest(ctx, null as any);
};

export {
  listServers,
  setServer,
  addServer,
  delServer,
  modifyOrder
};
