import { Context } from 'hono';
import jwt from 'jsonwebtoken';
import { createRes } from '../lib/utils';
import config from '../lib/config';

export const createSession = async (c: Context) => {
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    body = {};
  }
  const { username = '', password = '' } = body;
  if (!username || !password) {
    return c.json(createRes(1, 'Username and password cannot be empty'), 400);
  }
  if (username.trim() === config.webUsername && password.trim() === config.webPassword) {
    const token = jwt.sign({ username }, config.webSecret, { expiresIn: '7d' });
    return c.json(createRes({ data: token }));
  } else {
    return c.json(createRes(1, 'username or password is incorrect'), 401);
  }
};

export const verifySession = async (c: Context) => {
  const authHeader = c.req.header('authorization');
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2) {
      const scheme = parts[0].trim().toLowerCase();
      const token = parts[1].trim();
      if (scheme === 'bearer') {
        try {
          const { username } = jwt.verify(token, config.webSecret) as any;
          if (username !== config.webUsername) {
            return c.json(createRes(1, 'Verification failure'), 401);
          }
          return c.json(createRes({ msg: 'Verification success' }));
        } catch (error: any) {
          return c.json(createRes(1, 'Verification failure'), 401);
        }
      }
    }
  }
  return c.json(createRes(1, 'Verification failure'), 401);
};
