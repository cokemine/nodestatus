import { Context, Middleware } from 'koa';
import {
  bulkCreateServer,
  createServer as _addServer,
  delServer as _delServer,
  getListServers,
  setServer as _setServer,
  setServerOrder
} from '../model/server';
import { Server } from '../../types/server';
import { createRes } from '../lib/utils';

async function handleRequest<T>(ctx: Context, handler: Promise<T>): Promise<void> {
  try {
    ctx.body = createRes({ data: await handler });
  } catch (err: any) {
    ctx.status = 500;
    ctx.body = createRes(1, err.message);
  }
}

const listServers: Middleware = async ctx => {
  //const result = await getListServers();

  // (result as BoxItem[]).sort((x, y) => y.order - x.order);

  await handleRequest(ctx, getListServers());
};

const setServer: Middleware = async ctx => {
  const { username } = ctx.request.body;
  const data: Partial<Server> = ctx.request.body.data;
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
  const { order = [] } = ctx.request.body as { order: Array<{ username: string, from: number, to: number }> };
  await handleRequest(ctx, Promise.all(order.map(item => setServerOrder(item.username, item.from, item.to))));
};

export {
  listServers,
  setServer,
  addServer,
  delServer,
  modifyOrder
};
