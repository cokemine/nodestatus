import { Middleware } from '@koa/router';
import jwt from 'jsonwebtoken';
import { createRes } from '../lib/utils';
import config from '../lib/config';

export const createSession: Middleware = ctx => {
  const { username = '', password = '' } = ctx.request.body;
  if (!username || !password) {
    ctx.status = 400;
    ctx.body = createRes(1, 'Username and password cannot be empty');
    return;
  }
  if (username.trim() === config.webUsername && password.trim() === config.webPassword) {
    const token = jwt.sign({ username }, config.webSecret, { expiresIn: '7d' });
    ctx.body = createRes({ data: token });
  } else {
    ctx.status = 401;
    ctx.body = createRes(1, 'username or password is incorrect');
  }
};

export const verifySession: Middleware = ctx => {
  if (ctx.header && ctx.header.authorization) {
    const parts = ctx.header.authorization.split(' ');
    if (parts.length === 2) {
      const scheme = parts[0].trim().toLowerCase();
      const token = parts[1].trim();
      if (scheme === 'bearer') {
        try {
          const { username } = jwt.verify(token, config.webSecret) as any;
          if (username !== config.webUsername) {
            ctx.status = 401;
            ctx.body = createRes(1, 'Verification failure');
            return;
          }
          ctx.body = createRes({ msg: 'Verification success' });
          return;
        } catch (error: any) {
          ctx.status = 401;
          ctx.body = createRes(1, 'Verification failure');
          return;
        }
      }
    }
  }
  ctx.status = 401;
  ctx.body = createRes(1, 'Verification failure');
};
