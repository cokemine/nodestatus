import { PrismaClient } from '@prisma/client';
import config from './config';


const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${ config.database }`
    }
  }
});

export default prisma;
