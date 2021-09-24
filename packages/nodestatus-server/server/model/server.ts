import { Server, IResp } from '../../types/server';
import { createRes, emitter } from '../lib/utils';
import prisma from '../lib/prisma';

async function handleRequest(callback: () => Promise<IResp>): Promise<IResp> {
  try {
    return await callback();
  } catch (error: any) {
    return createRes(1, error.message);
  }
}

export function getServer(username: string): Promise<IResp> {
  return handleRequest(async () => {
    const server = await prisma.server.findUnique({
      where: {
        username
      },
    });
    return createRes(
      server ? 0 : 1,
      server ? 'ok' : 'Server Not Found',
      server
    );
  });
}

export function createServer(item: Server): Promise<IResp> {
  return handleRequest(async () => {
    await prisma.server.create({ data: item });
    return createRes();
  });
}

export function bulkCreateServer(items: Server[]): Promise<IResp> {
  return handleRequest(async () => {
    await (prisma.server as any).createMany({
      data: items,
      skipDuplicates: true
    });
    return createRes();
  });
}

export function delServer(username: string): Promise<IResp> {
  return handleRequest(async () => {
    await prisma.server.delete({
      where: {
        username
      },
    });
    return createRes();
  });
}

export function getListServers(): Promise<IResp> {
  return handleRequest(async () => {
    const result = await prisma.server.findMany();
    return createRes({ data: result });
  });
}

export function setServer(username: string, obj: Partial<Server>): Promise<IResp> {
  return handleRequest(async () => {
    await prisma.server.update({
      where: {
        username
      },
      data: obj
    });
    const shouldDisconnect = !!(obj.username || obj.password || obj.disabled === true);
    emitter.emit('update', username, shouldDisconnect);
    obj.username && emitter.emit('update', obj.username, true);
    return createRes();
  });
}
