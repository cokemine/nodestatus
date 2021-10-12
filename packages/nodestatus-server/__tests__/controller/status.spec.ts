import { mockReset } from 'jest-mock-extended';
import { hash } from 'bcryptjs';
import { addServer, authServer, getListServers, getServer, setServer } from '../../server/controller/status';
import {
  getListServers as _getListServers,
  createServer as _addServer,
  getServer as _getServer,
  setServer as _setServer,
  getServerPassword
} from '../../server/model/server';
import { IServer, Prisma } from '../../types/server';

jest.mock('../../server/model/server');

const GetListServers = _getListServers as jest.MockedFunction<typeof _getListServers>;
const CreateServer = _addServer as jest.MockedFunction<typeof _addServer>;
const GetServer = _getServer as jest.MockedFunction<typeof _getServer>;
const SetServer = _setServer as jest.MockedFunction<typeof _setServer>;
const GetServerPassword = getServerPassword as jest.MockedFunction<typeof getServerPassword>;

afterEach(() => {
  [GetListServers, CreateServer, GetServer, SetServer, GetServerPassword].forEach(mockReset);
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
  GetListServers.mockResolvedValueOnce([]);
  expect(getListServers()).resolves.toEqual({ code: 0, data: {}, msg: 'ok' });
});

test('Create a server and find unique Server', async () => {
  const server = mockServerInput('username'), iServer = mockIServer(server);
  await expect(addServer(server)).resolves.toEqual({ code: 0, data: null, msg: 'ok' });
  GetServer.mockResolvedValueOnce(iServer);
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
  GetServer.mockResolvedValueOnce(mockIServer('username', true));
  await expect(getServer('username')).resolves.toEqual({
    code: 1,
    data: null,
    msg: 'Server disabled'
  });
});

test('get List Servers', async () => {
  const servers = ['Megumi', 'Siesta', 'Emilia'].map(name => mockServerInput(name));

  for (const server of servers) {
    await expect(addServer(server)).resolves.toEqual({ code: 0, data: null, msg: 'ok' });
  }
  GetListServers.mockResolvedValueOnce(servers.map(({ name }) => mockIServer(name)));
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

test('auth password', async () => {
  const password = await hash('username', 8);
  GetServerPassword.mockResolvedValue(password);
  await expect(authServer('username', 'username')).resolves.toBe(true);
  await expect(authServer('username', 'false_password')).resolves.toBe(false);
  /* NULL USERNAME */
  GetServerPassword.mockResolvedValue(null);
  return expect(authServer('username2', 'username2')).resolves.toBe(false);
});
