interface BaseItem {
  id: number;
  name: string;
  host: string;
  type: string;
  location: string;
  region: string;
  order: number;
}

export interface BoxItem extends BaseItem {
  status: Record<string, never>;
}

export type IResp = {
  code: 0 | 1;
  data: Record<string, any> | null | string;
  msg: string;
};

export interface StatusItem extends BaseItem {
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
  };
}

export interface ServerItem extends BaseItem {
  id: number;
  username: string;
  name: string;
  host: string;
  type: string;
  location: string;
  region: string;
  status: 'disabled' | 'enabled';
}

export interface ITable {
  name: string;
  location: string;
  region: string;
  status: boolean;
  uptime: string | number;
  load: string | number;
}

export interface RowServer extends BaseItem {
  username: string;
  disabled: boolean;
}
