import Router from '@koa/router';
import { createSession, verifySession } from './controller/user';
import {
  removeServer, getListServers, addServer, setServer, modifyOrder, queryEvents, removeEvent
} from './controller/web';

const router = new Router({ prefix: '/api' });

/* 假装用 session */
router.get('/session', verifySession);
router.post('/session', createSession);

router.get('/server', getListServers);
router.post('/server', addServer);
router.put('/server', setServer);
router.put('/server/order', modifyOrder);
router.delete('/server/:username', removeServer);

router.get('/event', queryEvents);
router.delete('/event/:id?', removeEvent);

export default router;
