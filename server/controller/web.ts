import { Context, Middleware } from 'koa';
import {
  getListServers,
  setServer as _setServer,
  createServer as _addServer,
  bulkCreateServer,
  delServer as _delServer
} from '../model/server';
import { IServer, IResp } from '../../types/server';
import { createRes } from '../lib/utils';

const handleRequest = async (ctx: Context, handler: Promise<IResp>): Promise<void> => {
  const result = await handler;
  if (result.code) {
    ctx.status = 500;
  }
  ctx.body = result;
};

const listServers: Middleware = async ctx => {
  await handleRequest(ctx, getListServers());
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
    } catch (e) {
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

export {
  listServers,
  setServer,
  addServer,
  delServer
};
