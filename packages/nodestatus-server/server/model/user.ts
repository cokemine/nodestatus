/* Deprecated */
import { IResp, IServer } from '../../types/server';
import { createRes } from '../lib/utils';
import { User } from '../schema/server';
import { getServer } from './server';

async function handleRequest(callback: () => Promise<IResp>): Promise<IResp> {
  try {
    return await callback();
  } catch (error: any) {
    return createRes(1, error.message);
  }
}

export function getUser(username: string): Promise<IResp> {
  return handleRequest(async () => {
    const result = await User.findOne({
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

export function getUserPassword(username: string): Promise<IResp> {
  return handleRequest(async () => {
    const result = await getServer(username);
    if (result.code) return result;
    return createRes(0, (result.data as IServer).password);
  });
}
