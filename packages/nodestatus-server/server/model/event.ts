import prisma from '../lib/prisma';

export const createEvent = (username: string, created_at?: Date) => prisma.event.create({
  data: {
    username,
    created_at
  }
});

export const updateEvent = (username: string, resolved = true) => prisma.event.updateMany({
  where: {
    AND: [
      { username },
      { resolved: false }
    ]
  },
  data: {
    resolved
  }
});

export const readEvents = () => prisma.event.findMany({});
