import os from 'os';
import ws from 'ws';
import { Server } from 'http';
import { isIPv4 } from 'net';
import msgpack from 'msgpack-lite';
import { getListServers, authServer } from '../controller/server';
import ipc from './ipc';
import { logger } from './utils';
import type { Box, ServerItem, Servers } from '../../types/server';

class NodeStatus {
  private ioPub = new ws.Server({ noServer: true });
  private ioConn = new ws.Server({ noServer: true });
  private servers: Servers = {};
  private serversPub: ServerItem[] = [];
  private map = new WeakMap<ws, string>();
  private isBanned = new Map<string, boolean>();

  private setBan(address: string, t: number, reason: string): void {
    if (this.isBanned.get(address)) return;
    this.isBanned.set(address, true);
    logger.warn(`${ address } was banned ${ t } seconds, reason: ${ reason }`);
    const id = setTimeout(() => {
      this.isBanned.delete(address);
      clearTimeout(id);
    }, t * 1000);
  }

  public init(server: Server) {

    server.on('upgrade', (request, socket, head) => {
      const pathname = request.url;
      if (pathname === '/connect') {
        this.ioConn.handleUpgrade(request, socket as any, head, ws => {
          this.map.set(ws, (request.headers?.['x-forwarded-for'] as any)?.split(',')?.[0]?.trim() || request.socket.remoteAddress);
          this.ioConn.emit('connection', ws);
        });
      } else if (pathname === '/public') {
        this.ioPub.handleUpgrade(request, socket as any, head, ws => {
          this.ioPub.emit('connection', ws);
        });
      } else {
        socket.destroy();
      }
    });

    this.ioConn.on('connection', socket => {
      const address = this.map.get(socket);
      if (typeof address === 'undefined') {
        return socket.close();
      }
      socket.send('Authentication required');
      logger.info(`${ address } is trying to connect to server`);
      socket.once('message', async (buf: Buffer) => {
        let username = '', password = '';
        if (this.isBanned.get(address)) {
          socket.send('You are banned. Please try to connect after 60 / 120 seconds');
        } else try {
          ({ username, password } = msgpack.decode(buf));
          username = username.trim();
          password = password.trim();
          if (Object.keys(this.servers[username].status).length) {
            socket.send('Only one connection per user allowed.');
            this.setBan(address, 120, 'Only one connection per user allowed.');
          }
        } catch (e) {
          socket.send('Please check your login details.');
          this.setBan(address, 120, 'it is an idiot.');
          socket.close();
        }
        if (!username || !password) {
          socket.send('Username or password must not be blank.');
          this.setBan(address, 60, 'username or password was blank');
        } else if (!await authServer(username, password)) {
          socket.send('Wrong username and/or password.');
          this.setBan(address, 60, 'use wrong username and/or password.');
        } else {
          socket.send('Authentication successful. Access granted.');
          socket.send(`You are connecting via: ${ isIPv4(address) ? 'IPv4' : 'IPv6' }`);
          logger.info(`${ address } has connected to server`);

          socket.on('message', (buf: Buffer) => this.servers[username]['status'] = msgpack.decode(buf));

          socket.once('close', () => {
            this.servers[username]['status'] = {};
            logger.warn(`${ address } disconnected`);
          });
        }
      });
    });

    this.ioPub.on('connection', socket => {
      const runPush = () =>
        socket.send(JSON.stringify({
          servers: this.serversPub,
          updated: ~~(Date.now() / 1000)
        }));
      runPush();
      const id = setInterval(runPush, Number(process.env.interval));
      socket.on('close', () => clearInterval(id));
    });
  }

  public async updateStatus(username ?: string) {
    const box = (await getListServers()).data as Box;
    if (username) {
      if (!box[username])
        delete this.servers[username];
      else this.servers[username] = Object.assign(box[username], { status: this.servers?.[username]?.status || {} });
    } else {
      for (const k of Object.keys(box)) {
        if (!this.servers[k]) this.servers[k] = Object.assign(box[k], { status: {} });
      }
    }
    this.serversPub = Object.values(this.servers).sort((x, y) => y.id - x.id);
  }
}

export const instance = new NodeStatus();

export async function createIO(server: Server): Promise<void> {
  await instance.updateStatus();
  instance.init(server);
  ipc.listen(os.platform() === 'win32' ? '\\\\.\\pipe\\nodestatus_ipc' : '/tmp/nodestatus_unix.sock');
}
