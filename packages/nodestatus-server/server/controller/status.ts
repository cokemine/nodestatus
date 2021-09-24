import { compareSync } from 'bcryptjs';
import {
  getListServers as _getListServers,
  createServer as _addServer,
  getServer as _getServer,
  setServer as _setServer,
  delServer as _delServer,
  getServerPassword
} from '../model/server';
import { createRes } from '../lib/utils';
import type { Server, IResp, Box, IServer, BoxItem } from '../../types/server';

async function handleRequest<T = any>(handler: Promise<T>): Promise<IResp<T>> {
  let data: T;
  try {
    data = await handler;
  } catch (error: any) {
    return createRes(1, error.message);
  }
  return createRes({ data });
}

export async function authServer(username: string, password: string): Promise<boolean> {
  const res = await handleRequest(getServerPassword(username));
  if (res.code || !res.data) return false;
  return compareSync(password, res.data);
}

export function addServer(obj: Server): Promise<IResp<void>> {
  return handleRequest(_addServer(obj));
}

export function setServer(username: string, obj: Partial<Server>): Promise<IResp<void>> {
  return handleRequest(_setServer(username, obj));
}

export function delServer(username: string): Promise<IResp<void>> {
  return handleRequest(_delServer(username));
}

export async function getListServers(): Promise<IResp<Box>> {
  const result = await handleRequest(_getListServers());
  if (result.code) return result as any;
  const obj: Box = {};

  result.data.forEach(item => {
    const { username, disabled, ..._item } = item;
    if (disabled) return;
    obj[username] = _item;
  });
  return createRes({ data: obj });
}

export async function getServer(username: string): Promise<IResp<BoxItem | null>> {
  const result = await handleRequest(_getServer(username));
  if (result.code || !result.data) return result;
  const data = result.data;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { username: _, disabled, ...item } = data;
  if (disabled) return createRes(1, 'Server disabled');
  return createRes({ data: item });
}


export function getRawListServers(): Promise<IResp<IServer[]>> {
  return handleRequest(_getListServers());
}



