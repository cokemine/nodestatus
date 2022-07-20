import Router from '@koa/router';
import { createSession, verifySession } from './controller/user';
import {
  removeServer, getListServers, addServer, setServer, modifyOrder, queryEvents, removeEvent, queryConfig
} from './controller/web';

const router = new Router({ prefix: '/api' });

/* 假装用 session */
router.get('/session', verifySession);
router.post('/session', createSession);

router.get('/servers', getListServers);
router.post('/servers', addServer);
router.put('/servers', setServer);
router.put('/servers/order', modifyOrder);
router.delete('/servers/:username', removeServer);

router.get('/events', queryEvents);
router.delete('/events/:id?', removeEvent);

/* Config */

router.get('/config', queryConfig);

export default router;
