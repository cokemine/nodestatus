import EventEmitter from 'events';
import { configure, getLogger } from 'log4js';
import { IResp } from '../../types/server';

configure({
  appenders: {
    out: { type: 'stdout' },
  },
  categories: {
    default: { appenders: ['out'], level: 'info' }
  }
});
export const logger = getLogger();

export const emitter = new EventEmitter();

export const createRes = (code: 0 | 1 | Partial<IResp> = 0, msg = 'ok', data: Record<string, any> | null = null): IResp => {
  if (typeof code === 'object') {
    const {
      code: _code = 0,
      msg = 'ok',
      data = null
    } = code;
    return {
      code: _code,
      msg,
      data
    };
  }
  return {
    code,
    msg,
    data
  };
};
