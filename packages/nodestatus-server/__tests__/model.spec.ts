import { EventEmitter } from 'events';
import { DeepMockProxy } from 'jest-mock-extended/lib/Mock';
import { mockDeep, mockReset } from 'jest-mock-extended';
import prisma from '../server/lib/prisma';
import {
  createServer,
  getServer,
  getListServers,
  setServer,
  delServer,
  bulkCreateServer, setOrder
} from '../server/model/server';
import { emitter as Emitter } from '../server/lib/utils';
import { Prisma } from '../types/server';

jest.mock('../server/lib/utils', () => {
  const originalModule = jest.requireActual('../server/lib/utils');
  return {
    __esModule: true,
    ...originalModule,
    emitter: mockDeep<EventEmitter>()
  };
});

const emitter = Emitter as DeepMockProxy<EventEmitter>;


afterEach(async () => {
  await setOrder('');
  mockReset(emitter);
  return prisma.$transaction([prisma.server.deleteMany({}), prisma.option.deleteMany({})]);
});

const mockServer = (str: string): Prisma.ServerCreateInput => ({
  name: str,
  username: str,
  password: str,
  region: str,
  type: str,
  location: str
});

const mockResolve = (server: Prisma.ServerCreateInput) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = server;
  return {
    ...rest,
    disabled: false
  };
};

test('Init getListServers should call emitter', async () => {
  const result = await getListServers();
  expect(result).toEqual([]);
  expect(emitter.emit.mock.calls.length).toBe(1);
  /* not initial shouldn't call emitter */
  await getListServers();
  expect(emitter.emit.mock.calls.length).toBe(1);
});

test('Create a server and find unique Server', async () => {
  const server = mockServer('username');
  await expect(createServer(server)).resolves.toBeUndefined();
  const result = await getServer('username');
  /* Test resolveResult function */
  ['password', 'created_at', 'updated_at'].forEach(prop => expect(result).not.toHaveProperty(prop));
  expect(result).toMatchObject({
    ...mockResolve(server),
    /* disabled should default to be false */
    disabled: false
  });
  /* first server order should be 1 */
  expect(result?.order).toBe(1);
  /* Should call emitter */
  expect(emitter.emit.mock.calls.length).toBe(1);
  expect(emitter.emit.mock.calls[0][1]).toBe('username');
});

test('Create Multi servers with getListServers', async () => {
  const server1 = mockServer('Megumi');
  await expect(createServer(server1)).resolves.toBeUndefined();
  const server2 = mockServer('Siesta');
  await expect(createServer(server2)).resolves.toBeUndefined();
  const server3 = mockServer('Emilia');
  await expect(createServer(server3)).resolves.toBeUndefined();
  expect(emitter.emit.mock.calls.length).toBe(3);

  const result = await getListServers();
  expect(result).toMatchObject([server1, server2, server3].map(mockResolve));

  for (let i = 0; i < 3; ++i) {
    expect(result[i].order).toBe(i + 1);
  }
});

test('Create servers with same username', async () => {
  const server1 = mockServer('username');
  await expect(createServer(server1)).resolves.toBeUndefined();
  expect(emitter.emit.mock.calls.length).toBe(1);
  const server2 = mockServer('username');
  await expect(createServer(server2)).rejects.toThrowError('Unique constraint failed');
  expect(emitter.emit.mock.calls.length).toBe(1);
});

test('Bulk create servers', async () => {
  const servers = [mockServer('Megumi'), mockServer('Siesta'), mockServer('Emilia')];
  await expect(bulkCreateServer(servers)).resolves.toBeUndefined();

  const result = await getListServers();
  await expect(result).toMatchObject(servers.map(mockResolve));


  for (let i = 0; i < 3; ++i) {
    expect(result[i].order).toBe(i + 1);
  }

  expect(emitter.emit.mock.calls.length).toBe(1);
  expect(emitter.emit.mock.calls[0][1]).toBeUndefined();
});

test('Update server', async () => {
  const server1 = mockServer('username');

  await expect(createServer(server1)).resolves.toBeUndefined();
  await expect(getServer('username')).resolves.toHaveProperty('region', 'username');
  expect(emitter.emit.mock.calls.length).toBe(1);

  await expect(setServer('username', { region: 'US' })).resolves.toBeUndefined();
  await expect(getServer('username')).resolves.toHaveProperty('region', 'US');
  expect(emitter.emit.mock.calls.length).toBe(2); // Set server should call emitter

  await expect(setServer('username', { location: '美国' })).resolves.toBeUndefined();
  await expect(getServer('username')).resolves.toHaveProperty('location', '美国');
  expect(emitter.emit.mock.calls.length).toBe(3);

  /* Update the non username or password or disabled field */
  for (let i = 1; i < emitter.emit.mock.calls.length; ++i) {
    expect(emitter.emit.mock.calls[i][0]).toBe('update');
    expect(emitter.emit.mock.calls[i][1]).toBe('username');
    expect(emitter.emit.mock.calls[i][2]).toBe(false);
  }

  /* Update password or disabled field */
  await expect(setServer('username', { password: 'password' })).resolves.toBeUndefined();
  expect(emitter.emit.mock.calls.length).toBe(4);
  expect(emitter.emit.mock.calls[3][2]).toBe(true);

  await expect(setServer('username', { disabled: true })).resolves.toBeUndefined();
  expect(emitter.emit.mock.calls.length).toBe(5);
  expect(emitter.emit.mock.calls[4][2]).toBe(true);

  /* Update Username field */
  await expect(setServer('username', { username: 'newUsername' })).resolves.toBeUndefined();
  await expect(getServer('newUsername')).resolves.toHaveProperty('username', 'newUsername');
  expect(emitter.emit.mock.calls.length).toBe(7);
  expect(emitter.emit.mock.calls[5][1]).toBe('username');
  expect(emitter.emit.mock.calls[5][2]).toBe(true);
  expect(emitter.emit.mock.calls[6][1]).toBe('newUsername');
  expect(emitter.emit.mock.calls[6][2]).toBe(true);
});

test('Delete a server', async () => {
  const servers = [mockServer('Megumi'), mockServer('username'), mockServer('Siesta'), mockServer('Emilia')];
  await expect(bulkCreateServer(servers)).resolves.toBeUndefined();

  await expect(delServer('username')).resolves.toBeUndefined();
  await expect(getServer('username')).resolves.toBeNull();
  expect(emitter.emit.mock.calls.length).toBe(2);
  expect(emitter.emit.mock.calls[1][1]).toBe('username');
  expect(emitter.emit.mock.calls[1][2]).toBe(true);

  const result = await getListServers();
  /* 删掉中间的服务器， order 应该改变 */
  for (let i = 0; i < 3; ++i) {
    expect(result[i].order).toBe(i + 1);
  }
});

test('Set order', async () => {
  await expect(bulkCreateServer([mockServer('Megumi'), mockServer('Siesta'), mockServer('Emilia'), mockServer('Irina')])).resolves.toBeUndefined();
  const servers = await getListServers();
  const ids = servers.map(({ id }) => id).sort(() => Math.random() - 0.5);
  await setOrder(ids.join(','));
  /* Set order should call query order and emitter */
  expect(emitter.emit.mock.calls.length).toBe(2);
  const result = await getListServers();
  result.forEach(({ id, order }) => expect(order).toBe(ids.findIndex(i => i === id) + 1));

  await createServer(mockServer('username'));
  const server = await getServer('username');
  ids.push(server?.id as number);
  const result2 = await getListServers();
  expect(result2).toHaveLength(5);
  result2.forEach(({ id, order }) => expect(order).toBe(ids.findIndex(i => i === id) + 1));
});
