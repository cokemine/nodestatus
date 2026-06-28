import { Hono } from 'hono';
import { createSession, verifySession } from './controller/user';
import {
  addServer,
  getListServers,
  modifyOrder,
  queryConfig,
  queryEvents,
  removeEvent,
  removeServer,
  setServer,
} from './controller/web';

const adminApi = new Hono();
const webApi = new Hono();

/* Admin endpoints */
adminApi.get('/session', verifySession);
adminApi.post('/session', createSession);

adminApi.get('/servers', getListServers);
adminApi.post('/servers', addServer);
adminApi.put('/servers', setServer);
adminApi.put('/servers/order', modifyOrder);
adminApi.delete('/servers/:username', removeServer);

adminApi.get('/events', queryEvents);
adminApi.delete('/events/:id?', removeEvent);

/* Web public config */
webApi.get('/config', queryConfig);

export { adminApi, webApi };
