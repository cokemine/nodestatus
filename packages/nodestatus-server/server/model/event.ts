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

export const readEvents = (size?: number, offset?: number) => prisma.$transaction([
  prisma.event.count(),
  prisma.event.findMany({
    take: size,
    skip: offset,
    orderBy: {
      id: 'desc'
    }
  })
]);

export const deleteEvent = (id: number) => prisma.event.delete({
  where: {
    id
  }
});

export const deleteAllEvents = () => prisma.event.deleteMany({});
