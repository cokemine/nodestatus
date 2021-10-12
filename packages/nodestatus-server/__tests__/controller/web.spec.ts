import supertest from 'supertest';
import Koa from 'koa';
import { mockReset } from 'jest-mock-extended';

import koaBody from 'koa-body';
import {
  listServers,
  setServer,
  addServer,
  delServer,
  modifyOrder
} from '../../server/controller/web';
import { mockServerInput, mockIServer } from '../lib';
import router from '../../server/router';
import { GetListServers, CreateServer, GetServer, GetServerPassword, SetServer } from './model.mock';

jest.mock('../../server/model/server');
const server = new Koa().use(koaBody()).use(router.routes()).use(router.allowedMethods()).callback();

const request = supertest(server);

afterEach(() => {
  [GetListServers, CreateServer, GetServer, SetServer, GetServerPassword].forEach(mockReset);
});

test('create a server', async () => {
  const server = mockServerInput('username');
  const res = await request.post('/api/server')
    .send({ data: JSON.stringify(server) })
    .expect(200);
  expect(res.body).toEqual({ code: 0, msg: 'ok', data: null });
  //expect(CreateServer.mock.calls.length).toBe(1);

  CreateServer.mockRejectedValueOnce('Error');
  const res2 = await request.post('/api/server')
    .send({ data: JSON.stringify(server) })
    .expect(200);
  expect(res2.body).toEqual({ code: 0, msg: 'ok', data: null });
});
