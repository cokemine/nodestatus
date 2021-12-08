import { mockReset } from 'jest-mock-extended';
import { hash } from 'bcryptjs';
import {
  addServer, authServer, getListServers, getServer, setServer
} from '../../server/controller/status';
import {
  readServersList,
  createServer,
  readServer,
  updateServer,
  readServerPassword
} from '../../server/model/server';
import { IServer, Prisma } from '../../types/server';

jest.mock('../../server/model/server');

const ReadServersList = readServersList as jest.MockedFunction<typeof readServersList>;
const CreateServer = createServer as jest.MockedFunction<typeof createServer>;
const ReadServer = readServer as jest.MockedFunction<typeof readServer>;
const UpdateServer = updateServer as jest.MockedFunction<typeof updateServer>;
const ReadServerPassword = readServerPassword as jest.MockedFunction<typeof readServerPassword>;

afterEach(() => {
  [ReadServersList, CreateServer, ReadServer, UpdateServer, ReadServerPassword].forEach(mockReset);
});

const mockServerInput = (str: string): Prisma.ServerCreateInput => ({
  name: str,
  username: str,
  password: str,
  region: str,
  type: str,
  location: str
});

const mockIServer = (str: string | Prisma.ServerCreateInput, disabled = false): IServer => {
  let server: Prisma.ServerCreateInput;
  if (typeof str === 'object') {
    server = str;
  } else {
    server = mockServerInput(str);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = server;
  return {
    ...rest,
    id: 1,
    order: 1,
    disabled
  };
};

test('Call get servers first and expect empty object', () => {
  ReadServersList.mockResolvedValueOnce([]);
  expect(getListServers()).resolves.toEqual({ code: 0, data: {}, msg: 'ok' });
});

test('Create a server and find unique Server', async () => {
  const server = mockServerInput('username'),
    iServer = mockIServer(server);
  await expect(addServer(server)).resolves.toEqual({ code: 0, data: null, msg: 'ok' });
  ReadServer.mockResolvedValueOnce(iServer);
  const result = await getServer('username');
  expect(result.code).toBe(0);
  expect(result.msg).toBe('ok');
  ['password', 'created_at', 'updated_at', 'username', 'disabled'].forEach(prop => expect(result.data).not.toHaveProperty(prop));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { disabled, username, ...rest } = iServer;
  expect(result.data).toEqual(rest);

  // /* NOT Find server */
  // const result2 = await getServer('username2');
  // expect(result2.code).toBe(1);
  // console.log(result2.msg);
  // expect(result2.data).toBe(null);
});

test('Set Server with disabled', async () => {
  await expect(setServer('username', {
    disabled: true
  })).resolves.toEqual({ code: 0, data: null, msg: 'ok' });
  ReadServer.mockResolvedValueOnce(mockIServer('username', true));
  await expect(getServer('username')).resolves.toEqual({
    code: 1,
    data: null,
    msg: 'Server disabled'
  });
});

test('get List Servers', async () => {
  const servers = ['Megumi', 'Siesta', 'Emilia'].map(name => mockServerInput(name));
  await Promise.all(servers.map(
    server => expect(addServer(server)).resolves.toEqual({
      code: 0,
      data: null,
      msg: 'ok'
    })
  ));
  ReadServersList.mockResolvedValueOnce(servers.map(({ name }) => mockIServer(name)));
  const result = await getListServers();
  expect(result).toMatchObject({
    code: 0,
    msg: 'ok'
  });
  const { data } = result;
  expect(Object.keys(data)).toHaveLength(3);
  for (const name of Object.keys(data)) {
    ['password', 'created_at', 'updated_at', 'username', 'disabled'].forEach(prop => expect(data[name]).not.toHaveProperty(prop));
  }
});

test('auth password', async () => {
  const password = await hash('username', 8);
  ReadServerPassword.mockResolvedValue(password);
  await expect(authServer('username', 'username')).resolves.toBe(true);
  await expect(authServer('username', 'false_password')).resolves.toBe(false);
  /* NULL USERNAME */
  ReadServerPassword.mockResolvedValue(null);
  return expect(authServer('username2', 'username2')).resolves.toBe(false);
});
