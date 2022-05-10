import React, { useState, FC, useEffect } from 'react';
import { parseLoad, parseUpdateTime } from '@nodestatus/web-utils/shared';
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
        timeSince: parseUpdateTime(updated)
      };
      for (const item of servers) {
        const isOnline = item.status.online4 || item.status.online6;
        value.servers.push({
          id: item.id,
          name: item.name,
          location: item.location,
          region: item.region,
          load: isOnline ? parseLoad(item.status.load) : '-',
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
