import { emitter } from '../lib/utils';
import prisma from '../lib/prisma';
import type { IServer, Prisma, Server, PrismaClient } from '../../types/server';

const resolveResult = (item: Server | null): IServer | null => {
  if (!item) return item;
  type Key = keyof Server;
  for (const key of ['password', 'created_at', 'updated_at'])
    delete item[key as Key];
  return Object.assign(item, { order: orderMap.get(item.id) || 0 });
};

const orderMap = new Map<number, number>();

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
  const queries: [Promise<Server[]>, Promise<void>?] = [prisma.server.findMany()];
  !orderMap.size && queries.push(queryOrder());

  const [items] = await Promise.all(queries as [Promise<Server[]>, Promise<void>]);

  return items.map(item => resolveResult(item)) as IServer[];
}

export async function createServer(item: Prisma.ServerCreateInput): Promise<void> {
  await prisma.$transaction(async prisma => {
    const server = await prisma.server.create({ data: item });
    const order = Array.from(orderMap.keys());
    order.push(server.id);
    await setOrder(order.join(','), prisma as PrismaClient);
  });
}

export async function bulkCreateServer(items: Prisma.ServerCreateInput[]): Promise<void> {
  /* https://github.com/prisma/prisma/issues/7374 */
  // await prisma.server.createMany({
  //   data: items,
  //   skipDuplicates: true
  // });
  await prisma.$transaction(async prisma => {
    const order: number[] = [];
    await Promise.all(items.map(item =>
      prisma.server
        .create({ data: item })
        .then(server => order.push(server.id))
    ));
    const newOrder = Array.from(orderMap.keys()).concat(order);
    await setOrder(newOrder.join(','), prisma as PrismaClient);
  });
}

export async function delServer(username: string): Promise<void> {
  await prisma.$transaction(async prisma => {
    const server = await prisma.server.delete({
      where: {
        username
      },
    });
    orderMap.delete(server.id);
    await setOrder(Array.from(orderMap.keys()).join(), prisma as PrismaClient);
  });
  emitter.emit('update', username, true);
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

export async function setOrder(order: string, Prisma = prisma): Promise<void> {
  await Prisma.order.upsert({
    where: { id: 1 },
    update: { order },
    create: { order }
  });
  updateOrder(order);
}

const queryOrder = async (): Promise<void> => {
  const order = await prisma.order.findUnique({
    where: {
      id: 1
    }
  });

  return updateOrder(order?.order || '');
};

const updateOrder = (order: string): void => {
  orderMap.clear();
  const orderList = order.split(',') || [];
  for (let i = 0; i < orderList.length; ++i) {
    orderMap.set(Number(orderList[i]), i + 1);
  }
  emitter.emit('update');
};
