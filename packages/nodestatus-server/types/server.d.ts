import type { Prisma } from '@prisma/client';

type Server = Prisma.ServerCreateInput;


export interface BaseItem {
  id: number;
  name: string;
  type: string;
  location: string;
  region: string;
}



export interface BoxItem extends BaseItem {
  order: number;
}

export type IServer = { username: string, password?: string, disabled?: boolean, order?: number } & BaseItem;

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

export type IResp = {
  code: 0 | 1,
  data: Record<string, any> | null | string,
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

