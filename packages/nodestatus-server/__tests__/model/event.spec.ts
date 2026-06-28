import { afterEach, expect, it } from 'vitest';
import prisma from '../../server/lib/prisma';
import { createEvent, deleteAllEvents, deleteEvent, readEvents, updateEvent } from '../../server/model/event';

afterEach(async () => {
  await prisma.event.deleteMany({});
});

it('create Event', async () => {
  await createEvent('server01');
  const events = await prisma.event.findMany({});
  expect(events).toHaveLength(1);
  expect(events[0]).toHaveProperty('resolved', false);
  expect(events[0]).toHaveProperty('username', 'server01');
});

it('read Events', async () => {
  await expect(readEvents()).resolves.toStrictEqual([0, []]);
  await createEvent('username01');
  const events = await readEvents();
  expect(events[0]).toBe(1);
  expect(events[1]).toHaveLength(1);
});

it('resolve Event', async () => {
  await createEvent('server01');
  await updateEvent('server01');
  const events = await readEvents();
  expect(events[0]).toBe(1);
  expect(events[1]).toHaveLength(1);
  expect(events[1][0]).toHaveProperty('resolved', true);
});

it('delete Event', async () => {
  const created = await createEvent('server01');
  await deleteEvent(created.id);
  const events = await prisma.event.findMany({});
  expect(events).toHaveLength(0);
});

it('delete All Events', async () => {
  await createEvent('server01');
  await createEvent('server02');
  await deleteAllEvents();
  const events = await prisma.event.findMany({});
  expect(events).toHaveLength(0);
});
