export type {
  IResp, IServer, ServerItem, Event
} from '../../../../types';

export interface ITable {
  name: string;
  location: string;
  region: string;
  status: boolean;
  uptime: string | number;
  load: string | number;
}
