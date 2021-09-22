import { compareSync } from 'bcryptjs';
import {
  getListServers as _getListServers,
  createServer as _addServer,
  getServer as _getServer,
  setServer as _setServer,
  delServer as _delServer
} from '../model/server';
import { createRes } from '../lib/utils';
import type { IServer, IResp, Box, BoxItem } from '../../types/server';

export async function authServer(username: string, password: string): Promise<boolean> {
  const result = await _getServer(username, true);
  if (result.code) return false;
  const data = result.data as IServer;
  if (data.disabled || !data.password) return false;
  return compareSync(password, data.password);
}

export async function addServer(obj: IServer): Promise<IResp> {
  const result = await _getServer(obj.username);
  if (!result.code) {
    return createRes(1, 'Username duplicate');
  }
  return _addServer(obj);
}

export async function setServer(username: string, obj: Partial<IServer>): Promise<IResp> {
  const result = await _getServer(username);
  if (result.code) return result;
  return _setServer(username, obj);
}

export async function delServer(username: string): Promise<IResp> {
  const result = await _getServer(username);
  if (result.code) {
    return result;
  }
  return _delServer(username);
}

export async function getListServers(): Promise<IResp> {
  const result = await _getListServers();
  if (result.code) return result;
  const obj: Box = {};

  (result.data as Array<IServer>).forEach(item => {
    const { username, disabled, ..._item } = item;
    if (disabled) return;
    obj[username] = _item as BoxItem;
  });
  return createRes({ data: obj });
}

export async function getServer(username: string): Promise<IResp> {
  const result = await _getServer(username);
  if (result.code) return result;
  const data = result.data as IServer;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { username: _, disabled, ...item } = data;
  if (disabled) return createRes(1, 'Server disabled');
  return createRes({ data: item });
}

export {
  _getListServers as getRawListServers
};


