import Server from '../schema/server';
import { IServer, IResp } from '../../types/server';
import { createRes } from '../lib/utils';

async function handleRequest(callback: () => Promise<IResp>): Promise<IResp> {
  try {
    return await callback();
  } catch (error) {
    return createRes(1, error.message);
  }
}

export function getServer(username: string): Promise<IResp> {
  return handleRequest(async () => {
    const result = await Server.findOne({
      where: {
        username
      }
    });
    return createRes(
      result ? 0 : 1,
      result ? 'ok' : 'User Not Found',
      result
    );
  });
}

export function getServerPassword(username: string): Promise<IResp> {
  return handleRequest(async () => {
    const result = await getServer(username);
    if (result.code) return result;
    return createRes(0, (result.data as IServer).password);
  });
}

export function addServer(server: IServer): Promise<IResp> {
  return handleRequest(async () => {
    await Server.create(server);
    return createRes();
  });
}

export function delServer(username: string): Promise<IResp> {
  return handleRequest(async () => {
    await Server.destroy({
      where: {
        username
      }
    });
    return createRes();
  });
}

export function setServer(username: string, obj: IServer): Promise<IResp> {
  return handleRequest(async () => {
    await Server.update(obj, {
      where: {
        username
      }
    });
    return createRes();
  });
}

export function getListServers(): Promise<IResp> {
  return handleRequest(async () => {
    const result = await Server.findAll({
      attributes: {
        exclude: ['password', 'createdAt', 'updatedAt', 'disabled']
      },
      raw: true
    });

    return createRes({ data: result });
  });
}
