import { IServer, Prisma, Server } from '../../types/server';
import { emitter } from '../lib/utils';
import prisma from '../lib/prisma';

const resolveResult = (item: Server | null): IServer | null => {
  if (!item) return item;
  type Key = keyof Server;
  for (const key of ['password', 'created_at', 'updated_at'])
    delete item[key as Key];
  return item as IServer;
};


export async function getServer(username: string): Promise<IServer | null> {
  const item = await prisma.server.findUnique({
    where: {
      username
    },
  });
  return resolveResult(item);
}

export async function getServerPassword(username: string): Promise<string | null | undefined> {
  const item = await prisma.server.findUnique({
    where: {
      username
    },
  });
  return item?.password;
}

export async function getListServers(): Promise<IServer[]> {
  const items = await prisma.server.findMany();
  return items.map(item => resolveResult(item)) as IServer[];
}

export async function createServer(item: Prisma.ServerCreateInput): Promise<void> {
  await prisma.server.create({ data: item });
}

export async function bulkCreateServer(items: Prisma.ServerCreateInput[]): Promise<void> {
  await (prisma.server as any).createMany({
    data: items,
    skipDuplicates: true
  });
}

export async function delServer(username: string): Promise<void> {
  await prisma.server.delete({
    where: {
      username
    },
  });
}

export async function setServer(username: string, obj: Partial<Server>): Promise<void> {
  await prisma.server.update({
    where: {
      username
    },
    data: obj
  });
  const shouldDisconnect = !!(obj.username || obj.password || obj.disabled === true);
  emitter.emit('update', username, shouldDisconnect);
  obj.username && emitter.emit('update', obj.username, true);
}
