import { IServer, Prisma } from '../types/server';

export const mockServerInput = (str: string): Prisma.ServerCreateInput => ({
  name: str,
  username: str,
  password: str,
  region: str,
  type: str,
  location: str
});

export const mockIServer = (() => (str: string | Prisma.ServerCreateInput, disabled = false): IServer => {
  let server: Prisma.ServerCreateInput;
  let id = 1;
  if (typeof str === 'object') {
    server = str;
  } else {
    server = mockServerInput(str);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = server;
  return {
    ...rest,
    order: id,
    id: id++,
    disabled
  };
})();
