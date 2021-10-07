import { createServer, getServer } from '../server/model/server';
import prisma from './prisma';
import type { Server } from '../types/server';

describe('I am a girl', () => {
  test('Find unique server with order is id', async () => {
    const server: Server = {
      id: 1,
      name: 'My server',
      username: 'username',
      password: 'password',
      region: 'CN',
      type: 'KVM',
      location: 'Beijing',
      disabled: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    prisma.server.findUnique.mockResolvedValue(server);
    await createServer(server);
    const { created_at, updated_at, password, ...rest } = server;
    await expect(getServer('username')).resolves.toEqual({
      ...rest,
      order: 1
    });
  });
});
