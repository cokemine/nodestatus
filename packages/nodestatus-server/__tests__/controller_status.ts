import { addServer, getListServers, getServer, setServer } from '../server/controller/status';
import prisma from '../server/lib/prisma';
import { Prisma } from '../types/server';

afterEach(() => {
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

test('Call get servers first', () => {
  return expect(getListServers()).resolves.toEqual({ code: 0, data: {}, msg: 'ok' });
});

test('Create a server and find unique Server', async () => {
  await expect(addServer(mockServer('username'))).resolves.toEqual({ code: 0, data: null, msg: 'ok' });
  const result = await getServer('username');
  expect(result.code).toBe(0);
  expect(result.msg).toBe('ok');
  ['password', 'created_at', 'updated_at', 'username', 'disabled'].forEach(prop => expect(result.data).not.toHaveProperty(prop));

  // /* NOT Find server */
  // const result2 = await getServer('username2');
  // expect(result2.code).toBe(1);
  // console.log(result2.msg);
  // expect(result2.data).toBe(null);
});

test('Set Server with disabled', async () => {
  await expect(addServer(mockServer('username'))).resolves.toEqual({ code: 0, data: null, msg: 'ok' });
  await expect(setServer('username', {
    disabled: true
  })).resolves.toEqual({ code: 0, data: null, msg: 'ok' });
  await expect(getServer('username')).resolves.toEqual({
    code: 1,
    data: null,
    msg: 'Server disabled'
  });
});

test('get List Servers', async () => {
  const servers = ['Megumi', 'Siesta', 'Emilia'].map(name => mockServer(name));

  for (const server of servers) {
    await expect(addServer(server)).resolves.toEqual({ code: 0, data: null, msg: 'ok' });
  }
  const result = await getListServers();
  expect(result).toMatchObject({
    code: 0,
    msg: 'ok'
  });
  const { data } = result;
  expect(Object.keys(data)).toHaveLength(3);
  for (const name in data) {
    ['password', 'created_at', 'updated_at', 'username', 'disabled'].forEach(prop => expect(data[name]).not.toHaveProperty(prop));
  }
});
