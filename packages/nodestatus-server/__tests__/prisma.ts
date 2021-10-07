import path from 'path';

process.env.DATABASE = path.resolve(__dirname, '../db.base.sqlite');
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';
import prisma from '../server/lib/prisma';

import type { PrismaClient } from '@prisma/client';


jest.mock('../server/lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));
beforeEach(() => {
  mockReset(prisma);
});

test('prisma', () => {
  expect(true).toBe(true);
});

export default prisma as unknown as DeepMockProxy<PrismaClient>;
