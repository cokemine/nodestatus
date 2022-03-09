import EventEmitter from 'events';
import { configure, getLogger } from 'log4js';
import { IResp } from '../../types/server';
import config from './config';

configure({
  appenders: {
    out: { type: 'stdout' }
  },
  categories: {
    default: { appenders: ['out'], level: config.verbose ? 'debug' : 'info' }
  }
});
export const logger = getLogger();

export const emitter = new EventEmitter();

export function createRes<T = any>(code: 0 | 1 | Partial<IResp<T>> = 0, msg = 'ok', data: T | null = null): IResp<T> {
  if (typeof code === 'object') {
    const data = code.data || null;
    delete code.data;
    return {
      code: 0,
      msg: 'ok',
      data,
      ...code
    } as IResp<T>;
  }
  return {
    code,
    msg,
    data
  } as IResp<T>;
}
