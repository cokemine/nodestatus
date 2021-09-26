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

export async function getServerPassword(username: string): Promise<string | null> {
  const item = await prisma.server.findUnique({
    where: {
      username
    },
  });
  return item?.password || null;
}

export async function getListServers(): Promise<IServer[]> {
  const items = await prisma.server.findMany({
    orderBy: {
      order: 'asc'
    }
  });
  return items.map(item => resolveResult(item)) as IServer[];
}

export async function createServer(item: Prisma.ServerCreateInput): Promise<void> {
  // await prisma.server.create({ data: item });
  await prisma.$transaction(async prisma => {
    const server = await prisma.server.create({ data: item });
    return prisma.server.update({
      where: {
        id: server.id
      },
      data: {
        order: server.id
      }
    });
  });
  emitter.emit('update');
}

export async function bulkCreateServer(items: Prisma.ServerCreateInput[]): Promise<void> {
  /* https://github.com/prisma/prisma/discussions/7372 */
  // await prisma.server.createMany({
  //   data: items,
  //   skipDuplicates: true
  // });
  await Promise.all(items.map(item => prisma.server.create({ data: item })));
  emitter.emit('update');
}

export async function delServer(username: string): Promise<void> {
  await prisma.server.delete({
    where: {
      username
    },
  });
  emitter.emit('update', username);
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

export async function setServerOrder(username: string, from: number, to: number): Promise<void> {
  const min = Math.min(from, to);
  const max = Math.max(from, to);
  await prisma.$transaction([
    prisma.server.update({
      where: {
        username
      },
      data: {
        order: to
      }
    }),
    prisma.server.updateMany({
      where: {
        AND: [
          {
            order: { gte: min },
          },
          {
            order: { lte: max }
          },
          {
            username: { not: username }
          }
        ]
      },
      data: {
        order: {
          increment: from > to ? 1 : -1
        }
      }
    })
  ]);
  emitter.emit('update');
}
