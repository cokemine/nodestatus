import { Server, Order } from '../schema/server';
import { IServer, IResp } from '../../types/server';
import { createRes, emitter } from '../lib/utils';

async function handleRequest(callback: () => Promise<IResp>): Promise<IResp> {
  try {
    return await callback();
  } catch (error: any) {
    return createRes(1, error.message);
  }
}

export function getServer(username: string, getPassword = false): Promise<IResp> {
  return handleRequest(async () => {
    const exclude = ['createdAt', 'updatedAt'];
    !getPassword && exclude.push('password');
    const [result, orderResult] = await Promise.all([
      Server.findOne({
        where: {
          username
        },
        attributes: {
          exclude
        },
        raw: true
      }),
      getOrder()
    ]);
    if (orderResult.code) return orderResult;
    const order: string[] = orderResult.data?.split(',') || [];
    const newResult: any = result;
    for (let i = 0; i < order.length; ++i) {
      if (result?.id === Number(order[i])) {
        newResult.order = i + 1;
      }
    }
    return createRes(
      newResult ? 0 : 1,
      newResult ? 'ok' : 'User Not Found',
      newResult
    );
  });
}

export function createServer(server: IServer): Promise<IResp> {
  return handleRequest(async () => {
    const [item, result] = await Promise.all([Server.create(server), getOrder()]);
    let order = result.data as string;
    order = order ? `${ order },${ item.id }` : item.id;
    await updateOrder(order);
    return createRes();
  });
}

export function bulkCreateServer(servers: IServer[]): Promise<IResp> {
  return handleRequest(async () => {
    const [items, result] = await Promise.all([Server.bulkCreate(servers, { validate: true }), getOrder()]);
    if (result.code) return result;
    let order = result.data as string;
    for (const item of items) {
      order = order ? `${ order },${ item.id }` : item.id;
    }
    await updateOrder(order);
    return createRes();
  });
}

export function delServer(username: string): Promise<IResp> {
  return handleRequest(async () => {
    const [result, orderResult] = await Promise.all([getServer(username), getOrder()]);
    if (result.code) return result;
    if (orderResult.code) return orderResult;
    const server = result.data as Server;
    let order = orderResult.data?.split(',');
    if (order) {
      order = order.filter((id: string) => Number(id) !== server.id);
    }
    await Promise.all([server.destroy(), updateOrder(order.join(','))]);
    emitter.emit('update', username, true);
    return createRes();
  });
}

export function setServer(username: string, obj: Partial<IServer>): Promise<IResp> {
  return handleRequest(async () => {
    await Server.update(obj, {
      where: {
        username
      }
    });
    const shouldDisconnect = !!(obj.username || obj.password || obj.disabled === true);
    emitter.emit('update', username, shouldDisconnect);
    obj.username && emitter.emit('update', obj.username, true);
    return createRes();
  });
}

export function getListServers(): Promise<IResp> {
  return handleRequest(async () => {
    /* https://github.com/RobinBuschmann/sequelize-typescript/issues/763
    *  Maybe we should move to TypeORM or Prisma because low typescript support of sequelize
    *  */
    const [result, orderResult] = await Promise.all([
      Server.findAll({
        attributes: {
          exclude: ['password', 'createdAt', 'updatedAt']
        },
        raw: true
      }),
      getOrder()
    ]);

    if (orderResult.code) return orderResult;

    const order: string[] = orderResult.data?.split(',') || [];
    const newResult: Array<any> = [];
    const map = new Map<number, number>();

    for (let i = 0; i < order.length; ++i) {
      map.set(Number(order?.[i]), i + 1);
    }

    for (const item of result) {
      newResult.push({ ...item, order: map.get(item.id) });
    }

    return createRes({ data: newResult });
  });
}

export function getOrder(): Promise<IResp> {
  return handleRequest(async () => {
    const result = await Order.findAll({
      attributes: {
        exclude: ['id', 'createdAt', 'updatedAt']
      },
      raw: true
    });
    const order = result?.[0]?.order || '';
    return createRes({ data: order });
  });
}

export function updateOrder(order: string): Promise<IResp> {
  return handleRequest(async () => {
    await Order.destroy({
      truncate: true
    });
    await Order.create({ order });
    emitter.emit('update');
    return createRes();
  });
}
