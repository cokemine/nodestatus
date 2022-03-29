import { compare } from 'bcryptjs';
import {
  readServersList,
  createServer,
  readServer,
  updateServer,
  deleteServer,
  readServerPassword
} from '../model/server';
import {
  createEvent,
  updateEvent
} from '../model/event';
import { createRes } from '../lib/utils';
import type {
  Prisma, Server, IResp, Box, IServer, BoxItem
} from '../../types/server';

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
  const res = await handleRequest(readServerPassword(username));
  if (res.code || !res.data) return false;
  return compare(password, res.data);
}

export function addServer(obj: Prisma.ServerCreateInput): Promise<IResp<void>> {
  return handleRequest(createServer(obj));
}

export function setServer(username: string, obj: Partial<Server>): Promise<IResp<void>> {
  return handleRequest(updateServer(username, obj));
}

export function removeServer(username: string): Promise<IResp<void>> {
  return handleRequest(deleteServer(username));
}

export async function getListServers(): Promise<IResp<Box>> {
  const result = await handleRequest(readServersList());
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
  const result = await handleRequest(readServer(username));
  if (result.code || !result.data) return result;
  const { data } = result;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { username: _, disabled, ...item } = data;
  if (disabled) return createRes(1, 'Server disabled');
  return createRes({ data: item });
}

export function getRawListServers(): Promise<IResp<IServer[]>> {
  return handleRequest(readServersList());
}

export function createNewEvent(username: string, created_at?: Date): Promise<IResp> {
  return handleRequest(createEvent(username, created_at));
}

export function resolveEvent(username: string): Promise<IResp> {
  return handleRequest(updateEvent(username, true));
}
