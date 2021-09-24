import type { Server } from '@prisma/client';

export type * from '@prisma/client';
//export type Server = Prisma.ServerCreateInput;

export type BaseItem = Omit<Server, 'password' | 'disabled' | 'created_at' | 'updated_at'>

export type BoxItem = Omit<BaseItem, 'username'>

export type IServer = BaseItem & { disabled: boolean };

export type Box = Record<string, BoxItem>

export type ServerItem = BoxItem & {
  status: {
    online4: boolean;
    online6: boolean;
    uptime: number;
    load: number;
    cpu: number;
    network_rx: number;
    network_tx: number;
    network_in: number;
    network_out: number;
    memory_total: number;
    memory_used: number;
    swap_total: number;
    swap_used: number;
    hdd_total: number;
    hdd_used: number;
    custom: string;
  } | Record<string, never>
}

export type IResp<T = any> = {
  code: 0 | 1,
  data: T,
  msg: string
}

export type Options = {
  interval: number;
  usePush: boolean;
  pushTimeOut: number;
  telegram?: {
    bot_token: string;
    chat_id: string[];
    web_hook?: string;
    proxy?: string;
  }
}

