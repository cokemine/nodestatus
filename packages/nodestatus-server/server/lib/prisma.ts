import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt-ts';
import config from './config';

const databaseUrl = config.database;

let adapter: any;

if (databaseUrl.includes('mysql:')) {
  let url = databaseUrl;
  if (!url.includes('://')) {
    url = url.replace('mysql:', 'mysql://');
  }
  adapter = new PrismaMariaDb(url);
}
else if (databaseUrl.includes('postgresql:')) {
  let url = databaseUrl;
  if (!url.includes('://')) {
    url = url.replace('postgresql:', 'postgresql://');
  }
  adapter = new PrismaPg(url);
}
else {
  // SQLite
  adapter = new PrismaBetterSqlite3({ url: databaseUrl });
}

async function parseFields(server: any) {
  /* All fields must not be empty */
  for (const key in server) {
    if (server[key] === '') {
      delete server[key];
    }
  }

  /* Password should be encrypted */
  if (server.password) {
    server.password = await hash(server.password, 8);
  }
}

const basePrisma = new PrismaClient({ adapter });

const prisma = basePrisma.$extends({
  query: {
    server: {
      async create({ args, query }) {
        if (args.data) {
          await parseFields(args.data);
        }
        return query(args);
      },
      async createMany({ args, query }) {
        if (args.data) {
          if (Array.isArray(args.data)) {
            await Promise.all(args.data.map(server => parseFields(server)));
          }
          else {
            await parseFields(args.data);
          }
        }
        return query(args);
      },
      async update({ args, query }) {
        if (args.data) {
          await parseFields(args.data);
        }
        return query(args);
      },
      async updateMany({ args, query }) {
        if (args.data) {
          if (Array.isArray(args.data)) {
            await Promise.all(args.data.map(server => parseFields(server)));
          }
          else {
            await parseFields(args.data);
          }
        }
        return query(args);
      },
      async upsert({ args, query }) {
        if (args.create) {
          await parseFields(args.create);
        }
        if (args.update) {
          await parseFields(args.update);
        }
        return query(args);
      },
    },
  },
});

export default prisma;
