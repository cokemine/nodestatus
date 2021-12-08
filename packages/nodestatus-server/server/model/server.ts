import { emitter } from '../lib/utils';
import prisma from '../lib/prisma';
import type {
  IServer, Prisma, Server, PrismaClient
} from '../../types/server';

let isInitial = true;
const orderMap = new Map<number, number>();

const resolveResult = (item: Server | null): IServer | null => {
  if (!item) return item;
  type Key = keyof Server;
  for (const key of ['password', 'created_at', 'updated_at']) delete item[key as Key];
  return Object.assign(item, { order: orderMap.get(item.id) || item.id || 0 });
};

const updateCacheOrder = (order: string, shouldEmit = true): void => {
  orderMap.clear();
  const orderList = order === ''
    ? []
    : order.split(',');
  for (let i = 0; i < orderList.length; ++i) {
    orderMap.set(Number(orderList[i]), i + 1);
  }
  shouldEmit && emitter.emit('update');
};

const queryOrder = async (): Promise<void> => {
  const order = await prisma.option.findUnique({
    where: {
      name: 'order'
    }
  });
  isInitial = false;
  return updateCacheOrder(order?.value || '');
};

export async function updateOrder(order: string, Prisma = prisma): Promise<void> {
  const shouldEmit = Prisma === prisma;
  await Prisma.option.upsert({
    where: { name: 'order' },
    update: { value: order },
    create: { name: 'order', value: order }
  });
  updateCacheOrder(order, shouldEmit);
}

export async function readServer(username: string): Promise<IServer | null> {
  const item = await prisma.server.findUnique({
    where: {
      username
    }
  });
  return resolveResult(item);
}

export async function readServerPassword(username: string): Promise<string | null> {
  const item = await prisma.server.findUnique({
    where: {
      username
    }
  });
  return item?.password || null;
}

export async function readServersList(): Promise<IServer[]> {
  const queries: [Promise<Server[]>, Promise<void>?] = [prisma.server.findMany()];
  isInitial && queries.push(queryOrder());

  const [items] = await Promise.all(queries as [Promise<Server[]>, Promise<void>]);

  return items.map(item => resolveResult(item)) as IServer[];
}

export async function createServer(item: Prisma.ServerCreateInput): Promise<void> {
  await prisma.$transaction(async prisma => {
    const server = await prisma.server.create({ data: item });
    const order = Array.from(orderMap.keys());
    order.push(server.id);
    await updateOrder(order.join(','), prisma as PrismaClient);
  });
  emitter.emit('update', item.username);
}

export async function bulkCreateServer(items: Prisma.ServerCreateInput[]): Promise<void> {
  /* https://github.com/prisma/prisma/issues/7374 */
  // await prisma.server.createMany({
  //   data: items,
  //   skipDuplicates: true
  // });
  await prisma.$transaction(async prisma => {
    const order: number[] = [];
    await Promise.all(items.map(item => prisma.server
      .create({ data: item })
      .then(server => order.push(server.id))));
    const newOrder = Array.from(orderMap.keys()).concat(order);
    await updateOrder(newOrder.join(','), prisma as PrismaClient);
  });
  emitter.emit('update');
}

export async function deleteServer(username: string): Promise<void> {
  await prisma.$transaction(async prisma => {
    const server = await prisma.server.delete({
      where: {
        username
      }
    });
    orderMap.delete(server.id);
    await updateOrder(Array.from(orderMap.keys()).join(','), prisma as PrismaClient);
  });
  emitter.emit('update', username, true);
}

export async function updateServer(username: string, obj: Partial<Server>): Promise<void> {
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
