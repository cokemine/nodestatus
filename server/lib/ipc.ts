import net from 'net';
import { instance } from './io';
import { addServer, delServer, setServer, getRawListServers } from '../controller/server';
import { createRes } from './utils';
import type { IServer } from '../../types/server';

export default net.createServer(client => {
  client.on('data', async (buf: Buffer) => {
    try {
      const [method, payload] = buf.toString().trim().split(' @;@ ');
      switch (method) {
      case 'add': {
        const data: IServer = JSON.parse(payload);
        const status = await addServer(data);
        client.write(JSON.stringify(status));
        if (!status.code) await instance.updateStatus(data.username);
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
        if (!status.code) username === obj.username
          ? await instance.updateStatus(username)
          : await Promise.all([instance.updateStatus(username), instance.updateStatus(obj.username)]);
        break;
      }
      case 'del': {
        const status = await delServer(payload);
        client.write(JSON.stringify(status));
        if (!status.code) await instance.updateStatus(payload);
        break;
      }
      }
    } catch (error) {
      client.write(JSON.stringify(createRes(1, error.message)));
    }
  });
});
