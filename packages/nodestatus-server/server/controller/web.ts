import type { Context } from 'hono';
import config from '../lib/config';
import { createRes } from '../lib/utils';
import { deleteAllEvents, deleteEvent, readEvents } from '../model/event';
import {
  bulkCreateServer,
  createServer,
  deleteServer,
  readServersList,
  updateOrder,
  updateServer,
} from '../model/server';

async function handleRequest<T>(c: Context, handler: Promise<T>): Promise<Response> {
  try {
    return c.json(createRes({ data: await handler }));
  }
  catch (err: any) {
    return c.json(createRes(1, err.message), 500);
  }
}

async function getListServers(c: Context) {
  return handleRequest(c, readServersList().then(data => data.sort((x, y) => y.order - x.order)));
}

async function setServer(c: Context) {
  let body: any;
  try {
    body = await c.req.json();
  }
  catch {
    body = {};
  }
  const { username, data } = body;
  if (!username || !data) {
    return c.json(createRes(1, 'Wrong request'), 400);
  }
  if (username === data.username)
    delete data.username;
  return handleRequest(c, updateServer(username, data));
}

async function addServer(c: Context) {
  let data: any;
  try {
    data = await c.req.json();
  }
  catch {
    return c.json(createRes(1, 'Wrong request'), 400);
  }
  if (!data) {
    return c.json(createRes(1, 'Wrong request'), 400);
  }
  if (Object.hasOwnProperty.call(data, 'data')) {
    try {
      const d = JSON.parse(data.data);
      return handleRequest(c, bulkCreateServer(d));
    }
    catch {
      return c.json(createRes(1, 'Wrong request'), 400);
    }
  }
  else {
    return handleRequest(c, createServer(data));
  }
}

async function removeServer(c: Context) {
  const username = c.req.param('username') || '';
  if (!username) {
    return c.json(createRes(1, 'Wrong request'), 400);
  }
  return handleRequest(c, deleteServer(username));
}

async function modifyOrder(c: Context) {
  let body: any;
  try {
    body = await c.req.json();
  }
  catch {
    body = {};
  }
  const { order = [] } = body as { order: number[] };
  if (!order.length) {
    return c.json(createRes(1, 'Wrong request'), 400);
  }
  return handleRequest(c, updateOrder(order.join(',')));
}

async function queryEvents(c: Context) {
  const size = Number(c.req.query('size')) || 10;
  const offset = Number(c.req.query('offset')) || 0;
  return handleRequest(c, readEvents(size, offset).then(([count, list]) => ({ count, list })));
}

async function removeEvent(c: Context) {
  const id = c.req.param('id');
  if (id) {
    return handleRequest(c, deleteEvent(Number(id)));
  }
  else {
    return handleRequest(c, deleteAllEvents());
  }
}

async function queryConfig(c: Context) {
  return c.json({
    title: config.webTitle,
    subTitle: config.webSubtitle,
    headTitle: config.webHeadtitle,
  });
}

export {
  addServer,
  getListServers,
  modifyOrder,
  queryConfig,
  queryEvents,
  removeEvent,
  removeServer,
  setServer,
};
