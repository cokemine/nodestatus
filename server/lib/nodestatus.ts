import { Server } from 'http';
import { isIPv4 } from 'net';
import ws from 'ws';
import { timingSafeEqual } from 'crypto';
import { decode } from '@msgpack/msgpack';
import { Telegraf } from 'telegraf';
import HttpsProxyAgent from 'https-proxy-agent';
import { IPv6 } from 'ipaddr.js';
import { Box, Options, ServerItem, Servers } from '../../types/server';
import { logger, emitter } from './utils';
import { authServer, getListServers } from '../controller/status';

function callHook(instance: NodeStatus, hook: keyof NodeStatus, ...args: any[]) {
  try {
    if (typeof instance[hook] == 'function') {
      (instance[hook] as any).call(instance, ...args);
    }
  } catch (error) {
    logger.error(`[hook]: ${ hook } error: ${ error.message || error }`);
  }
}

export class NodeStatus {

  private server !: Server;
  private options !: Options;

  private ioPub = new ws.Server({ noServer: true });
  private ioConn = new ws.Server({ noServer: true });
  /* socket -> ip */
  private map = new WeakMap<ws, string>();
  /* username -> socket */
  private userMap = new Map<string, ws>();
  /* ip -> banned */
  private isBanned = new Map<string, boolean>();

  public servers: Servers = {};
  public serversPub: ServerItem[] = [];

  public onServerConnect?: (socket: ws) => unknown;
  public onServerBanned?: (address: string, reason: string) => unknown;
  public onServerConnected ?: (socket: ws, username: string) => unknown;
  public onServerDisconnected ?: (socket: ws, username: string) => unknown;

  constructor(server: Server, options: Options) {
    this.server = server;
    this.options = options;
    emitter.on('update', this.update.bind(this));
  }

  private setBan(socket: ws, address: string, t: number, reason: string): void {
    socket.close();
    if (this.isBanned.get(address)) return;
    this.isBanned.set(address, true);
    logger.warn(`${ address } was banned ${ t } seconds, reason: ${ reason }`);
    callHook(this, 'onServerBanned', address, reason);
    const id = setTimeout(() => {
      this.isBanned.delete(address);
      clearTimeout(id);
    }, t * 1000);
  }

  public launch(): Promise<void> {
    this.server.on('upgrade', (request, socket, head) => {
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
      callHook(this, 'onServerConnect', socket);
      socket.send('Authentication required');
      logger.info(`${ address } is trying to connect to server`);
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
        } catch (e) {
          socket.send('Please check your login details.');
          return this.setBan(socket, address, 120, 'it is an idiot.');
        }
        if (!await authServer(username, password)) {
          socket.send('Wrong username and/or password.');
          return this.setBan(socket, address, 60, 'use wrong username and/or password.');
        } else {
          socket.send('Authentication successful. Access granted.');
          let ipType = 'IPv6';
          if (isIPv4(address) || IPv6.parse(address).isIPv4MappedAddress()) {
            ipType = 'IPv4';
          }
          socket.send(`You are connecting via: ${ ipType }`);
          logger.info(`${ address } has connected to server`);
          socket.on('message', (buf: Buffer) => this.servers[username]['status'] = decode(buf) as any);
          this.userMap.set(username, socket);
          callHook(this, 'onServerConnected', socket, username);
          socket.once('close', () => {
            this.userMap.delete(username);
            this.servers[username] && (this.servers[username]['status'] = {});
            logger.warn(`${ address } disconnected`);
            callHook(this, 'onServerDisconnected', socket, username);
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
      const id = setInterval(runPush, this.options.interval);
      socket.on('close', () => clearInterval(id));
    });

    this.options.usePush && this.createPush();

    return this.update();
  }

  private async update(username ?: string): Promise<void> {
    const box = (await getListServers()).data as Box;
    if (!box) return;
    if (username) {
      if (!box[username])
        delete this.servers[username];
      else this.servers[username] = Object.assign(box[username], { status: this.servers?.[username]?.status || {} });
      const socket = this.userMap.get(username);
      socket && socket.terminate();
    } else {
      for (const k of Object.keys(box)) {
        if (!this.servers[k]) this.servers[k] = Object.assign(box[k], { status: {} });
      }
      for (const k of Object.keys(this.servers)) {
        if (!box[k]) delete this.servers[k];
      }
      for (const socket of this.userMap.values()) {
        socket.terminate();
      }
      this.userMap.clear();
    }
    this.serversPub = Object.values(this.servers).sort((x, y) => y.id - x.id);
  }

  /* This should move to another file later */
  private createPush(): void {
    const pushList: Array<(message: string) => void> = [];

    const getBotStatus = (): string => {
      let str = '';
      let online = 0;
      this.serversPub.forEach(item => {
        str += `节点名: *${ item.name }*\n当前状态: `;
        if (item.status.online4 || item.status.online6) {
          str += '✅*在线*\n';
          online++;
        } else {
          str += '❌*离线*';
          str += '\n\n';
          return;
        }
        str += `当前负载: ${ item.status.load.toFixed(2) } \n`;
        str += `当前CPU占用: ${ Math.round(item.status.cpu) }% \n`;
        str += `当前内存占用: ${ Math.round(item.status.memory_used / item.status.memory_total * 100) }% \n`;
        str += `当前硬盘占用: ${ Math.round(item.status.hdd_used / item.status.hdd_total * 100) }% \n`;
        str += '\n\n';
      });
      return `🍊*NodeStatus* \n🤖 当前有 ${ this.serversPub.length } 台服务器, 其中在线 ${ online } 台\n\n${ str }`;
    };

    const tgConfig = this.options.telegram;

    if (tgConfig?.bot_token) {

      const bot = new Telegraf(tgConfig.bot_token, {
        ...(tgConfig.proxy && {
          telegram: {
            agent: HttpsProxyAgent(tgConfig.proxy)
          }
        })
      });

      const chatId = new Set<string>(tgConfig.chat_id);

      bot.command('start', ctx => {
        const currentChat = ctx.message.chat.id.toString();
        if (chatId.has(currentChat)) {
          ctx.reply(`🍊NodeStatus\n🤖 Hi, this chat id is *${ currentChat }*.\nYou have access to this service. I will alert you when your servers changed.\nYou are currently using NodeStatus: *${ process.env.npm_package_version }*`, { parse_mode: 'Markdown' });
        } else {
          ctx.reply(`🍊NodeStatus\n🤖 Hi, this chat id is *${ currentChat }*.\nYou *do not* have permission to use this service.\nPlease check your settings.`, { parse_mode: 'Markdown' });
        }
      });

      bot.command('status', ctx => {
        if (chatId.has(ctx.message.chat.id.toString())) {
          ctx.reply(getBotStatus(), { parse_mode: 'Markdown' });
        } else {
          ctx.reply('🍊NodeStatus\n*No permission*', { parse_mode: 'Markdown' });
        }
      });

      if (tgConfig.web_hook) {
        const secretPath = `/telegraf/${ bot.secretPathComponent() }`;
        bot.telegram.setWebhook(`${ tgConfig.web_hook }${ secretPath }`).then(() => logger.info('🤖 Telegram Bot is running using webhook'));

        this.server.on('request', (req, res) => {
          if (req.url && req.url.length === secretPath.length && timingSafeEqual(Buffer.from(secretPath), Buffer.from(req.url))) {
            bot.webhookCallback(secretPath)(req, res);
            res.statusCode = 200;
          }
        });
      } else {
        bot.launch().then(() => logger.info('🤖 Telegram Bot is running using polling'));
      }

      pushList.push(message => [...chatId].map(id => bot.telegram.sendMessage(id, `${ message }`, { parse_mode: 'Markdown' })));
    }


    this.onServerConnected = (socket, username) => Promise.all(pushList.map(
      fn => fn(`🍊*NodeStatus* \n😀 One new server has connected! \n\n *用户名*: ${ username } \n *节点名*: ${ this.servers[username]['name'] } \n *时间*: ${ new Date() }`)
    ));
    this.onServerDisconnected = (socket, username) => Promise.all(pushList.map(
      fn => fn(`🍊*NodeStatus* \n😰 One server has disconnected! \n\n *用户名*: *${ username }* \n *节点名*: ${ this.servers[username]?.['name'] } \n *时间*: ${ new Date() }`)
    ));

  }
}
