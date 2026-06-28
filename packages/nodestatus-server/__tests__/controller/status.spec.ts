import type { IServer, Prisma } from '../../types/server';
import { hash } from 'bcrypt-ts';
import {
  afterEach,
  expect,
  it,
  vi,
} from 'vitest';
import {
  addServer,
  authServer,
  getListServers,
  getServer,
  setServer,
} from '../../server/controller/status';
import {
  createServer,
  readServer,
  readServerPassword,
  readServersList,
  updateServer,
} from '../../server/model/server';

vi.mock('../../server/model/server');

const ReadServersList = vi.mocked(readServersList);
const CreateServer = vi.mocked(createServer);
const ReadServer = vi.mocked(readServer);
const UpdateServer = vi.mocked(updateServer);
const ReadServerPassword = vi.mocked(readServerPassword);

afterEach(() => {
  [ReadServersList, CreateServer, ReadServer, UpdateServer, ReadServerPassword].forEach(fn => fn.mockReset());
});

function mockServerInput(str: string): Prisma.ServerCreateInput {
  return {
    name: str,
    username: str,
    password: str,
    region: str,
    type: str,
    location: str,
  };
}

function mockIServer(str: string | Prisma.ServerCreateInput, disabled = false): IServer {
  let server: Prisma.ServerCreateInput;
  if (typeof str === 'object') {
    server = str;
  }
  else {
    server = mockServerInput(str);
  }
  const { password: _password, ...rest } = server;
  return {
    ...rest,
    id: 1,
    order: 1,
    disabled,
  };
}

it('call get servers first and expect empty object', async () => {
  ReadServersList.mockResolvedValueOnce([]);
  await expect(getListServers()).resolves.toEqual({ code: 0, data: {}, msg: 'ok' });
});

it('create a server and find unique Server', async () => {
  const server = mockServerInput('username');
  const iServer = mockIServer(server);
  await expect(addServer(server)).resolves.toEqual({ code: 0, data: null, msg: 'ok' });
  ReadServer.mockResolvedValueOnce(iServer);
  const result = await getServer('username');
  expect(result.code).toBe(0);
  expect(result.msg).toBe('ok');
  ['password', 'created_at', 'updated_at', 'username', 'disabled'].forEach(prop => expect(result.data).not.toHaveProperty(prop));
  const { disabled: _disabled, username: _username, ...rest } = iServer;
  expect(result.data).toEqual(rest);

  // /* NOT Find server */
  // const result2 = await getServer('username2');
  // expect(result2.code).toBe(1);
  // console.log(result2.msg);
  // expect(result2.data).toBe(null);
});

it('set Server with disabled', async () => {
  await expect(
    setServer('username', {
      disabled: true,
    }),
  ).resolves.toEqual({ code: 0, data: null, msg: 'ok' });
  ReadServer.mockResolvedValueOnce(mockIServer('username', true));
  await expect(getServer('username')).resolves.toEqual({
    code: 1,
    data: null,
    msg: 'Server disabled',
  });
});

it('get List Servers', async () => {
  const servers = ['Megumi', 'Siesta', 'Emilia'].map(name => mockServerInput(name));
  await Promise.all(
    servers.map(server => expect(addServer(server)).resolves.toEqual({
      code: 0,
      data: null,
      msg: 'ok',
    })),
  );
  ReadServersList.mockResolvedValueOnce(servers.map(({ name }) => mockIServer(name)));
  const result = await getListServers();
  expect(result).toMatchObject({
    code: 0,
    msg: 'ok',
  });
  const { data } = result;
  expect(Object.keys(data)).toHaveLength(3);
  for (const name of Object.keys(data)) {
    ['password', 'created_at', 'updated_at', 'username', 'disabled'].forEach(prop => expect(data[name]).not.toHaveProperty(prop));
  }
});

it('auth password', async () => {
  const password = await hash('username', 8);
  ReadServerPassword.mockResolvedValue(password);
  await expect(authServer('username', 'username')).resolves.toBe(true);
  await expect(authServer('username', 'false_password')).resolves.toBe(false);
  /* NULL USERNAME */
  ReadServerPassword.mockResolvedValue(null);
  return expect(authServer('username2', 'username2')).resolves.toBe(false);
});
