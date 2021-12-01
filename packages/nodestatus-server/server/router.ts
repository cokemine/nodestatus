import Router from '@koa/router';
import { createSession, verifySession } from './controller/user';
import {
  delServer, listServers, addServer, setServer, modifyOrder, queryEvents
} from './controller/web';

const router = new Router({ prefix: '/api' });

/* 假装用 session */
router.get('/session', verifySession);
router.post('/session', createSession);

router.get('/server', listServers);
router.post('/server', addServer);
router.put('/server', setServer);
router.put('/server/order', modifyOrder);
router.delete('/server/:username', delServer);

router.get('/event', queryEvents);

export default router;
