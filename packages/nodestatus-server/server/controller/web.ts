import { Context } from 'hono';
import {
  bulkCreateServer,
  createServer,
  deleteServer,
  readServersList,
  updateServer,
  updateOrder
} from '../model/server';
import { createRes } from '../lib/utils';
import { deleteAllEvents, deleteEvent, readEvents } from '../model/event';
import config from '../lib/config';

async function handleRequest<T>(c: Context, handler: Promise<T>): Promise<Response> {
  try {
    return c.json(createRes({ data: await handler }));
  } catch (err: any) {
    return c.json(createRes(1, err.message), 500);
  }
}

const getListServers = async (c: Context) => {
  return handleRequest(c, readServersList().then(data => data.sort((x, y) => y.order - x.order)));
};

const setServer = async (c: Context) => {
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    body = {};
  }
  const { username, data } = body;
  if (!username || !data) {
    return c.json(createRes(1, 'Wrong request'), 400);
  }
  if (username === data.username) delete data.username;
  return handleRequest(c, updateServer(username, data));
};

const addServer = async (c: Context) => {
  let data: any;
  try {
    data = await c.req.json();
  } catch {
    return c.json(createRes(1, 'Wrong request'), 400);
  }
  if (!data) {
    return c.json(createRes(1, 'Wrong request'), 400);
  }
  if (Object.hasOwnProperty.call(data, 'data')) {
    try {
      const d = JSON.parse(data.data);
      return handleRequest(c, bulkCreateServer(d));
    } catch (error: any) {
      return c.json(createRes(1, 'Wrong request'), 400);
    }
  } else {
    return handleRequest(c, createServer(data));
  }
};

const removeServer = async (c: Context) => {
  const username = c.req.param('username') || '';
  if (!username) {
    return c.json(createRes(1, 'Wrong request'), 400);
  }
  return handleRequest(c, deleteServer(username));
};

const modifyOrder = async (c: Context) => {
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    body = {};
  }
  const { order = [] } = body as { order: number[] };
  if (!order.length) {
    return c.json(createRes(1, 'Wrong request'), 400);
  }
  return handleRequest(c, updateOrder(order.join(',')));
};

const queryEvents = async (c: Context) => {
  const size = Number(c.req.query('size')) || 10;
  const offset = Number(c.req.query('offset')) || 0;
  return handleRequest(c, readEvents(size, offset).then(([count, list]) => ({ count, list })));
};

const removeEvent = async (c: Context) => {
  const id = c.req.param('id');
  if (id) {
    return handleRequest(c, deleteEvent(Number(id)));
  } else {
    return handleRequest(c, deleteAllEvents());
  }
};

const queryConfig = async (c: Context) => c.json({
  title: config.webTitle,
  subTitle: config.webSubtitle,
  headTitle: config.webHeadtitle
});

export {
  getListServers,
  setServer,
  addServer,
  removeServer,
  modifyOrder,
  queryEvents,
  removeEvent,
  queryConfig
};
