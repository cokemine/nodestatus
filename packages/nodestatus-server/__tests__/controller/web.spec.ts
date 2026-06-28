import { vi, afterEach, expect, test } from 'vitest';
import { Context } from 'hono';
import {
  getListServers,
  setServer,
  addServer,
  removeServer,
  modifyOrder,
  queryEvents,
  removeEvent,
  queryConfig
} from '../../server/controller/web';
import {
  readServersList,
  updateServer,
  createServer,
  bulkCreateServer,
  deleteServer,
  updateOrder
} from '../../server/model/server';
import { readEvents, deleteEvent, deleteAllEvents } from '../../server/model/event';

vi.mock('../../server/model/server');
vi.mock('../../server/model/event');

const mockContext = (jsonBody: any = {}, queryParams: any = {}, routeParams: any = {}) => {
  const c = {
    req: {
      json: vi.fn().mockResolvedValue(jsonBody),
      query: vi.fn().mockImplementation((key) => queryParams[key]),
      param: vi.fn().mockImplementation((key) => routeParams[key])
    },
    json: vi.fn().mockImplementation((data, status) => ({ body: data, status: status || 200 }))
  } as unknown as Context;
  return c;
};

afterEach(() => {
  vi.clearAllMocks();
});

test('getListServers', async () => {
  const mockServers = [{ order: 1, name: 'srv1' }, { order: 2, name: 'srv2' }] as any;
  vi.mocked(readServersList).mockResolvedValueOnce(mockServers);

  const c = mockContext();
  const res: any = await getListServers(c);

  expect(readServersList).toHaveBeenCalled();
  // sorted by order descending: srv2 (order 2) then srv1 (order 1)
  expect(res.body).toEqual({ code: 0, data: [{ order: 2, name: 'srv2' }, { order: 1, name: 'srv1' }], msg: 'ok' });
});

test('setServer success', async () => {
  vi.mocked(updateServer).mockResolvedValueOnce(undefined as any);
  const c = mockContext({ username: 'srv1', data: { username: 'srv1', name: 'newname' } });
  const res: any = await setServer(c);

  expect(updateServer).toHaveBeenCalledWith('srv1', { name: 'newname' });
  expect(res.body).toEqual({ code: 0, data: null, msg: 'ok' });
});

test('addServer bulk', async () => {
  vi.mocked(bulkCreateServer).mockResolvedValueOnce(undefined as any);
  const c = mockContext({ data: JSON.stringify([{ username: 'srv1' }]) });
  const res: any = await addServer(c);

  expect(bulkCreateServer).toHaveBeenCalledWith([{ username: 'srv1' }]);
  expect(res.body).toEqual({ code: 0, data: null, msg: 'ok' });
});

test('removeServer', async () => {
  vi.mocked(deleteServer).mockResolvedValueOnce(undefined as any);
  const c = mockContext({}, {}, { username: 'srv1' });
  const res: any = await removeServer(c);

  expect(deleteServer).toHaveBeenCalledWith('srv1');
  expect(res.body).toEqual({ code: 0, data: null, msg: 'ok' });
});

test('modifyOrder', async () => {
  vi.mocked(updateOrder).mockResolvedValueOnce(undefined as any);
  const c = mockContext({ order: [1, 2, 3] });
  const res: any = await modifyOrder(c);

  expect(updateOrder).toHaveBeenCalledWith('1,2,3');
  expect(res.body).toEqual({ code: 0, data: null, msg: 'ok' });
});

test('queryEvents', async () => {
  vi.mocked(readEvents).mockResolvedValueOnce([1, [{ id: 1 }]] as any);
  const c = mockContext({}, { size: '5', offset: '2' });
  const res: any = await queryEvents(c);

  expect(readEvents).toHaveBeenCalledWith(5, 2);
  expect(res.body).toEqual({ code: 0, data: { count: 1, list: [{ id: 1 }] }, msg: 'ok' });
});

test('removeEvent single', async () => {
  vi.mocked(deleteEvent).mockResolvedValueOnce(undefined as any);
  const c = mockContext({}, {}, { id: '123' });
  const res: any = await removeEvent(c);

  expect(deleteEvent).toHaveBeenCalledWith(123);
  expect(res.body).toEqual({ code: 0, data: null, msg: 'ok' });
});

test('removeEvent all', async () => {
  vi.mocked(deleteAllEvents).mockResolvedValueOnce(undefined as any);
  const c = mockContext({}, {}, {});
  const res: any = await removeEvent(c);

  expect(deleteAllEvents).toHaveBeenCalled();
  expect(res.body).toEqual({ code: 0, data: null, msg: 'ok' });
});

test('queryConfig', async () => {
  const c = mockContext();
  const res: any = await queryConfig(c);
  expect(res.body).toHaveProperty('title');
});
