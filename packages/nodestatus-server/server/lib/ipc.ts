import net from 'net';
import {
  addServer, removeServer, getRawListServers, setServer
} from '../controller/status';
import { createRes } from './utils';
import type { Server } from '../../types/server';

export default function createIpc(): net.Server {
  return net.createServer(client => {
    client.on('data', async (buf: Buffer) => {
      try {
        const [method, payload] = buf.toString().trim().split(' @;@ ');
        switch (method) {
          case 'add': {
            const data: Server = JSON.parse(payload);
            const status = await addServer(data);
            client.write(JSON.stringify(status));
            break;
          }
          case 'list': {
            const status = await getRawListServers();
            client.write(JSON.stringify(status));
            break;
          }
          case 'set': {
            const obj = JSON.parse(payload);
            const { username } = obj;
            delete obj.username;
            if (obj.newUserName) {
              obj.username = obj.newUserName;
              delete obj.newUserName;
            }
            const status = await setServer(username, obj);
            client.write(JSON.stringify(status));
            break;
          }
          case 'del': {
            const status = await removeServer(payload);
            client.write(JSON.stringify(status));
            break;
          }
          default: {
            client.write(JSON.stringify(createRes(1, 'Unknown Method')));
          }
        }
      } catch (error: any) {
        client.write(JSON.stringify(createRes(1, error.message)));
      }
    });
  });
}
