import { Server } from 'ws';
import type { IWebSocket } from '../../types/server';

function heartbeat(this: IWebSocket) {
  this.isAlive = true;
}

export default function setupHeartbeat(io: Server, pingInterval: number) {
  io.on('connection', (socket: IWebSocket) => {
    socket.isAlive = true;
    socket.on('pong', heartbeat);
  });

  setInterval(() => {
    io.clients.forEach((socket: IWebSocket) => {
      if (!socket.isAlive) {
        return socket.terminate();
      }
      socket.isAlive = false;
      socket.ping();
    });
  }, pingInterval);
}
