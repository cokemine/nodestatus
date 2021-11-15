import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { Prisma } from '../../types/server';
import config from './config';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `${config.database}`
    }
  }
});

const actions = new Set(['create', 'createMany', 'update', 'updateMany', 'upsert']);

const parseFields = async (server: Prisma.ServerCreateInput) => {
  type Key = keyof Prisma.ServerCreateInput;

  /* All fields must not be empty */
  for (const key in server) {
    if (server[key as Key] === '') {
      delete server[key as Key];
    }
  }

  /* Password should be encrypted */
  if (server.password) {
    server.password = await hash(server.password, 8);
  }
};

prisma.$use(async (params, next) => {
  if (params.model !== 'Server' || !actions.has(params.action)) return next(params);
  const { data } = params.args;

  if (data instanceof Array) {
    await Promise.all(data.map(server => parseFields(server)));
  } else {
    await parseFields(data);
  }

  return next(params);
});

export default prisma;
