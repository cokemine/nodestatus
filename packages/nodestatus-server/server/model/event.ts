import prisma from '../lib/prisma';

export function createEvent(username: string, created_at?: Date) {
  return prisma.event.create({
    data: {
      username,
      created_at,
    },
  });
}

export function updateEvent(username: string, resolved = true) {
  return prisma.event.updateMany({
    where: {
      AND: [
        { username },
        { resolved: false },
      ],
    },
    data: {
      resolved,
    },
  });
}

export function readEvents(size?: number, offset?: number) {
  return prisma.$transaction([
    prisma.event.count(),
    prisma.event.findMany({
      take: size,
      skip: offset,
      orderBy: {
        id: 'desc',
      },
    }),
  ]);
}

export function deleteEvent(id: number) {
  return prisma.event.delete({
    where: {
      id,
    },
  });
}

export const deleteAllEvents = () => prisma.event.deleteMany({});
