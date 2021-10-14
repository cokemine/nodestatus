import React, { useState, FC, useEffect } from 'react';
import { ITable, ServerItem } from '../types';

interface IData {
  servers: Array<ServerItem>,
  updated: number;
}

interface IContext {
  servers: Array<ITable>,
  timeSince: string
}

export const StatusContext = React.createContext<IContext>({
  servers: [], timeSince: '从未.'
});

const getTimeSince = (updated: number): string => {
  const nowTime: number = Date.now() / 1000;
  if (!updated) return '从未.';
  const seconds: number = Math.floor(nowTime - updated);
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return `${interval} 年前.`;
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `${interval} 月前.`;
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `${interval} 日前.`;
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `${interval} 小时前.`;
  interval = Math.floor(seconds / 60);
  if (interval > 1) return `${interval} 分钟前.`;
  return '几秒前.';
};

export const StatusContextProvider: FC = ({ children }) => {
  const [status, setStatus] = useState<IContext>({ servers: [], timeSince: '从未.' });

  useEffect(() => {
    const ws = new WebSocket(`${document.location.protocol.replace('http', 'ws')}${window.location.host}/public`);
    ws.onopen = () => console.log('Connect to backend successfully!');
    ws.onclose = evt => console.log(`WebSocket disconnected: ${evt.reason}`);
    ws.onerror = evt => console.log(`An error occurred while connecting to the backend, ${evt}`);
    ws.onmessage = evt => {
      const data: IData = JSON.parse(evt.data);
      const { servers, updated } = data;
      const value: IContext = {
        servers: [],
        timeSince: getTimeSince(updated)
      };
      for (const item of servers) {
        const isOnline = item.status.online4 || item.status.online6;
        value.servers.push({
          name: item.name,
          location: item.location,
          region: item.region,
          load: isOnline ? item.status.load : '-',
          uptime: isOnline ? item.status.uptime : '-',
          status: isOnline
        });
      }
      setStatus(value);
    };
    return () => ws.close();
  }, []);

  return <StatusContext.Provider value={status}>{children}</StatusContext.Provider>;
};
