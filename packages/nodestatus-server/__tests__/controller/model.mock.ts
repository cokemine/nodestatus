import {
  getListServers as _getListServers,
  createServer as _addServer,
  getServer as _getServer,
  setServer as _setServer,
  getServerPassword
} from '../../server/model/server';

export const GetListServers = _getListServers as jest.MockedFunction<typeof _getListServers>;
export const CreateServer = _addServer as jest.MockedFunction<typeof _addServer>;
export const GetServer = _getServer as jest.MockedFunction<typeof _getServer>;
export const SetServer = _setServer as jest.MockedFunction<typeof _setServer>;
export const GetServerPassword = getServerPassword as jest.MockedFunction<typeof getServerPassword>;
