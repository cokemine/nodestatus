import { Server } from 'http';
import { isIPv4 } from 'net';
import timers from 'timers/promises';
import ws from 'ws';
import { decode } from '@msgpack/msgpack';
import { IPv6 } from 'ipaddr.js';
import { getLogger } from 'log4js';
import {
  Box, ServerItem, BoxItem, IWebSocket
} from '../../types/server';
import {
  authServer, createNewEvent, getListServers, getServer, resolveEvent
} from '../controller/status';
import {
  logger, emitter
} from './utils';
import setupHeartbeat from './heartbeat';

const loggerConnected = getLogger('Connected');
const loggerConnecting = getLogger('Connecting');
const loggerDisconnected = getLogger('Disconnected');
const loggerBanned = getLogger('Banned');

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
  pingInterval: number;
};

export default class NodeStatus {
  private readonly options !: Options;

  public server !: Server;

  private ioPub = new ws.Server({ noServer: true });

  private ioConn = new ws.Server({ noServer: true });

  /* username -> socket */
  private userMap = new Map<string, IWebSocket>();

  /* ip -> banned */
  private isBanned = new Map<string, boolean>();

  public servers: Record<string, ServerItem> = {};

  public serversPub: ServerItem[] = [];

  public onServerConnect?: (socket: IWebSocket) => unknown;

  public onServerBanned?: (address: string, reason: string) => unknown;

  public onServerConnected ?: (socket: IWebSocket, username: string) => unknown;

  public onServerDisconnected ?: (socket: IWebSocket, username: string) => unknown;

  public _serverConnectedPush ?: (socket: IWebSocket, username: string) => unknown;

  public _serverDisconnectedPush ?: (socket: IWebSocket, username: string, cb?: (now: Date) => void) => unknown;

  constructor(server: Server, options: Options) {
    this.server = server;
    this.options = options;
    emitter.on('update', this.updateStatus.bind(this));
  }

  private setBan(socket: ws, address: string, t: number, reason: string): void {
    socket.close();
    if (this.isBanned.get(address)) return;
    this.isBanned.set(address, true);
    loggerBanned.debug('Address:', address, '|', 'Reason:', reason);
    callHook(this, 'onServerBanned', address, reason);
    setTimeout(() => this.isBanned.delete(address), t * 1000);
  }

  public launch(): Promise<void> {
    const { interval, pingInterval } = this.options;

    setupHeartbeat(this.ioConn, pingInterval);
    setupHeartbeat(this.ioPub, pingInterval);

    this.server.on('upgrade', (request, socket, head) => {
      const pathname = request.url;
      if (pathname === '/connect') {
        this.ioConn.handleUpgrade(request, socket, head, (ws: IWebSocket) => {
          ws.ipAddress = (request.headers['x-forwarded-for'] as any)?.split(',')?.[0]?.trim() || request.socket.remoteAddress;
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

    this.ioConn.on('connection', (socket: IWebSocket) => {
      const address = socket.ipAddress;
      if (typeof address === 'undefined') {
        return socket.close();
      }
      callHook(this, 'onServerConnect', socket);
      socket.send('Authentication required');
      loggerConnecting.debug(`Address: ${address}`);
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
          /*
          * 当客户端与服务端断开连接时，客户端会自动重连。但是服务端可能需要等待下一个心跳检测周期才能断开与客户端的连接
          * Temporary Fix
          * Work in Progress
          *   */
          if (Object.keys(this.servers[username]?.status || {}).length) {
            const preSocket = this.userMap.get(username);
            if (preSocket) {
              if (preSocket.ipAddress === address) {
                preSocket.terminate();
              } else {
                preSocket.isAlive = false;
                preSocket.ping();
                const ac = new AbortController();
                const promise = timers.setTimeout((pingInterval + 5) * 1000, null, { signal: ac.signal });
                preSocket.on('close', () => ac.abort());
                try {
                  await promise;
                  socket.send('Only one connection per user allowed.');
                  return this.setBan(socket, address, 120, 'Only one connection per user allowed.');
                  // eslint-disable-next-line no-empty
                } catch (error: any) {
                }
              }
            }
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
        loggerConnected.info(`Username: ${username} | Address: ${address}`);
        resolveEvent(username).then();
        socket.on('message', (buf: Buffer) => this.servers[username].status = decode(buf) as ServerItem['status']);
        this.userMap.set(username, socket);

        callHook(this, 'onServerConnected', socket, username);
        callHook(this, '_serverConnectedPush', socket, username);

        socket.once('close', () => {
          this.userMap.delete(username);
          this.servers[username] && (this.servers[username].status = {});
          loggerDisconnected.warn(`Username: ${username} | Address: ${address}`);

          callHook(this, 'onServerDisconnected', socket, username);
          callHook(this, '_serverDisconnectedPush', socket, username, (now: Date) => createNewEvent(username, now).then());
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
