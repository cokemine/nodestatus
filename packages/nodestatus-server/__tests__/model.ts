import { EventEmitter } from 'events';
import { DeepMockProxy } from 'jest-mock-extended/lib/Mock';
import { mockDeep, mockReset } from 'jest-mock-extended';
import prisma from '../server/lib/prisma';
import { createServer, getServer, getListServers, setServer } from '../server/model/server';
import { emitter as Emitter } from '../server/lib/utils';
import type { Prisma } from '../types/server';
jest.mock( '../server/lib/utils', () => {
  const originalModule = jest.requireActual('../server/lib/utils');
  return {
    __esModule: true,
    ...originalModule,
    emitter: mockDeep<EventEmitter>(),
  };
});

const emitter = Emitter as DeepMockProxy<EventEmitter>;

beforeEach(() => {
  mockReset(emitter);
});

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

const mockResolve = (server: Prisma.ServerCreateInput) =>{
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = server;
  return {
    ...rest,
    disabled: false
  };
};

describe('Basic Tests', () => {
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
    expect(emitter.emit.mock.calls.length).toBe(1);
  });

  test('Create Multi servers with getListServers', async() => {
    const server1 = mockServer('username');
    await expect(createServer(server1)).resolves.toBeUndefined();
    const server2 = mockServer('username2');
    await expect(createServer(server2)).resolves.toBeUndefined();
    const server3 = mockServer('megumi');
    await expect(createServer(server3)).resolves.toBeUndefined();
    expect(emitter.emit.mock.calls.length).toBe(3);
    await expect(getListServers()).resolves.toMatchObject([server1,server2,server3].map(mockResolve));
    /* initial should call emitter */
    expect(emitter.emit.mock.calls.length).toBe(4);
  });

  test('Create servers with same username',async () => {
    const server1 = mockServer('username');
    await expect(createServer(server1)).resolves.toBeUndefined();
    expect(emitter.emit.mock.calls.length).toBe(1);
    const server2 = mockServer('username');
    await expect(createServer(server2)).rejects.toThrowError('Unique constraint failed');
    expect(emitter.emit.mock.calls.length).toBe(1);
  });

  test('Update server',async () => {
    const server1 = mockServer('username');

    await expect(createServer(server1)).resolves.toBeUndefined();
    await expect(getServer('username')).resolves.toHaveProperty('region', 'username');
    expect(emitter.emit.mock.calls.length).toBe(1);

    await expect(setServer('username', { region: 'US' })).resolves.toBeUndefined();
    await expect(getServer('username')).resolves.toHaveProperty('region', 'US');
    expect(emitter.emit.mock.calls.length).toBe(2);// Set server should call emitter

    await expect(setServer('username', { location: '美国' })).resolves.toBeUndefined();
    await expect(getServer('username')).resolves.toHaveProperty('location', '美国');
    expect(emitter.emit.mock.calls.length).toBe(3);
  });
});

