import { Server } from 'http';
import { isIPv4 } from 'net';
import ws from 'ws';
import { decode } from '@msgpack/msgpack';
import { IPv6 } from 'ipaddr.js';
import { Box, ServerItem, BoxItem } from '../../types/server';
import {
  authServer, createNewEvent, getListServers, getServer, resolveEvent
} from '../controller/status';
import { logger, emitter } from './utils';

function callHook(instance: NodeStatus, hook: keyof NodeStatus, ...args: any[]) {
  try {
    if (typeof instance[hook] === 'function') {
      (instance[hook] as any).call(instance, ...args);
    }
  } catch (error: any) {
    logger.error(`[hook]: ${hook} error: ${error.message || error}`);
  }
}

type Options = {
  interval: number;
  verbose: boolean;
};

export default class NodeStatus {
  private options !: Options;

  public server !: Server;

  private ioPub = new ws.Server({ noServer: true });

  private ioConn = new ws.Server({ noServer: true });

  /* socket -> ip */
  public ipMap = new WeakMap<ws, string>();

  /* username -> socket */
  private userMap = new Map<string, ws>();

  /* ip -> banned */
  private isBanned = new Map<string, boolean>();

  public servers: Record<string, ServerItem> = {};

  public serversPub: ServerItem[] = [];

  public onServerConnect?: (socket: ws) => unknown;

  public onServerBanned?: (address: string, reason: string) => unknown;

  public onServerConnected ?: (socket: ws, username: string) => unknown;

  public onServerDisconnected ?: (socket: ws, username: string) => unknown;

  constructor(server: Server, options: Options) {
    this.server = server;
    this.options = options;
    emitter.on('update', this.updateStatus.bind(this));
  }

  private setBan(socket: ws, address: string, t: number, reason: string): void {
    socket.close();
    if (this.isBanned.get(address)) return;
    this.isBanned.set(address, true);
    this.options.verbose && logger.warn(`${address} was banned ${t} seconds, reason: ${reason}`);
    callHook(this, 'onServerBanned', address, reason);
    setTimeout(() => this.isBanned.delete(address), t * 1000);
  }

  public launch(): Promise<void> {
    const { verbose, interval } = this.options;
    this.server.on('upgrade', (request, socket, head) => {
      const pathname = request.url;
      if (pathname === '/connect') {
        this.ioConn.handleUpgrade(request, socket, head, ws => {
          this.ipMap.set(
            ws,
            (request.headers['x-forwarded-for'] as any)?.split(',')?.[0]?.trim() || request.socket.remoteAddress
          );
          this.ioConn.emit('connection', ws);
        });
      } else if (pathname === '/public') {
        this.ioPub.handleUpgrade(request, socket, head, ws => {
          this.ioPub.emit('connection', ws);
        });
      } else {
        socket.destroy();
      }
    });

    this.ioConn.on('connection', socket => {
      const address = this.ipMap.get(socket);
      if (typeof address === 'undefined') {
        return socket.close();
      }
      callHook(this, 'onServerConnect', socket);
      socket.send('Authentication required');
      verbose && logger.info(`${address} is trying to connect to server`);
      socket.once('message', async (buf: Buffer) => {
        if (this.isBanned.get(address)) {
          socket.send('You are banned. Please try connecting after 60 / 120 seconds');
          return socket.close();
        }
        let username = '', password = '';
        try {
          ({ username, password } = decode(buf) as any);
          username = username.trim();
          password = password.trim();
          if (!this.servers[username]) {
            socket.send('Wrong username and/or password.');
            return this.setBan(socket, address, 120, 'Wrong username and/or password.');
          }
          if (Object.keys(this.servers[username]?.status || {}).length) {
            socket.send('Only one connection per user allowed.');
            return this.setBan(socket, address, 120, 'Only one connection per user allowed.');
          }
        } catch (error: any) {
          socket.send('Please check your login details.');
          return this.setBan(socket, address, 120, 'it is an idiot.');
        }
        if (!await authServer(username, password)) {
          socket.send('Wrong username and/or password.');
          return this.setBan(socket, address, 60, 'use wrong username and/or password.');
        }
        socket.send('Authentication successful. Access granted.');
        let ipType = 'IPv6';
        if (isIPv4(address) || IPv6.parse(address).isIPv4MappedAddress()) {
          ipType = 'IPv4';
        }
        socket.send(`You are connecting via: ${ipType}`);
        logger.info(`${address} has connected to server`);
        resolveEvent(username).then();
        socket.on('message', (buf: Buffer) => this.servers[username].status = decode(buf) as any);
        this.userMap.set(username, socket);
        callHook(this, 'onServerConnected', socket, username);
        socket.once('close', () => {
          this.userMap.delete(username);
          this.servers[username] && (this.servers[username].status = {});
          createNewEvent(username).then();
          logger.warn(`${address} disconnected`);
          callHook(this, 'onServerDisconnected', socket, username);
        });
      });
    });

    this.ioPub.on('connection', socket => {
      const runPush = () => socket.send(JSON.stringify({
        servers: this.serversPub,
        updated: ~~(Date.now() / 1000)
      }));
      runPush();
      const id = setInterval(runPush, interval);
      socket.on('close', () => clearInterval(id));
    });

    return this.updateStatus();
  }

  private async updateStatus(username ?: string, shouldDisconnect = false): Promise<void> {
    if (username) {
      const server = (await getServer(username)).data as BoxItem | null;
      if (!server) delete this.servers[username];
      else this.servers[username] = Object.assign(server, { status: this.servers?.[username]?.status || {} });
      shouldDisconnect && this.userMap.get(username)?.terminate() && this.userMap.delete(username);
    } else {
      const box = (await getListServers()).data as Box | null;
      if (!box) return;
      for (const k of Object.keys(box)) {
        if (!this.servers[k]) this.servers[k] = Object.assign(box[k], { status: {} });
        this.servers[k].order = box[k].order;
      }
      for (const k of Object.keys(this.servers)) {
        if (!box[k]) delete this.servers[k];
      }
      if (shouldDisconnect) {
        for (const socket of this.userMap.values()) {
          socket.terminate();
        }
        this.userMap.clear();
      }
    }
    this.serversPub = Object.values(this.servers).sort((x, y) => y.order - x.order);
  }
}
