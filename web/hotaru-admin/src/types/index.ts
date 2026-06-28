export type {
  Event,
  IResp,
  IServer,
  ServerItem,
} from '@nodestatus/web-utils/types';

export interface ITable {
  id: number;
  name: string;
  location: string;
  region: string;
  status: boolean;
  uptime: string | number;
  load: string | number;
}
