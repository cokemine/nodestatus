import prisma from '../lib/prisma';

export const createEvent = (username: string) => prisma.event.create({
  data: {
    username
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
