import prisma from '../../server/lib/prisma';
import {
  createEvent,
  updateEvent,
  readEvents
} from '../../server/model/event';

afterEach(() => prisma.event.deleteMany({}));

test('Create Event', async () => {
  await createEvent('server01');
  const events = await prisma.event.findMany({});
  expect(events).toHaveLength(1);
  expect(events[0]).toHaveProperty('resolved', false);
  expect(events[0]).toHaveProperty('username', 'server01');
});

test('Read Events', async () => {
  await expect(readEvents()).resolves.toStrictEqual([0, []]);
  await createEvent('username01');
  const events = await readEvents();
  expect(events[0]).toBe(1);
  expect(events[1]).toHaveLength(1);
});

test('Resolve Event', async () => {
  await createEvent('server01');
  await updateEvent('server01');
  const events = await readEvents();
  expect(events[0]).toBe(1);
  expect(events[1]).toHaveLength(1);
  expect(events[1][0]).toHaveProperty('resolved', true);
});
