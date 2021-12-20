import { computed, toRefs } from 'vue';

import { ServerItem } from '../../types';

interface Props {
  server: ServerItem;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default (props: Props) => {
  const { server } = toRefs(props);
  const getStatus = computed((): boolean => server.value.status.online4 || server.value.status.online6);

  const getLoad = computed((): string | number => {
    const load = Number(server.value.status.load.toFixed(2));
    return load % 1 ? load : Math.round(load);
  });

  const getCpuStatus = computed(
    (): number => (
      server.value.status.cpu === undefined
        ? 100
        : Math.round(server.value.status.cpu)
    )
  );

  const getNetworkProtocol = computed((): string => {
    if (server.value.status.online4 && server.value.status.online6) {
      return '双栈';
    } if (server.value.status.online4) {
      return 'IPv4';
    } if (server.value.status.online6) {
      return 'IPv6';
    } return '维护中';
  });

  const getRAMStatus = computed(
    (): number => (
      server.value.status.memory_total === undefined
        ? 100
        : Math.round(((server.value.status.memory_used / server.value.status.memory_total) * 100))
    )
  );

  const getHDDStatus = computed(
    (): number => (server.value.status.hdd_total === undefined
      ? 100
      : Math.round(((server.value.status.hdd_used / server.value.status.hdd_total) * 100))
    )
  );

  const getProcessBarStatus = computed(
    () => (data: number) => {
      if (data > 90) return 'error';
      if (data > 70) return 'warning';
      return 'success';
    }
  );

  const getUpTime = computed((): string => {
    let str = '-';
    if (getStatus.value) {
      const { uptime } = server.value.status;
      if (uptime >= 86400) str = `${Math.floor(uptime / 86400)} 天`;
      else {
        let h: string | number = Math.floor(uptime / 3600);
        let m: string | number = Math.floor((uptime / 60) % 60);
        let s: string | number = Math.floor(uptime % 60);
        h < 10 && (h = `0${h}`);
        m < 10 && (m = `0${m}`);
        s < 10 && (s = `0${s}`);
        str = `${h}:${m}:${s}`;
      }
    }
    return str;
  });

  const formatNetwork = computed(() => (data: number): string => {
    if (data < 1024) return `${data.toFixed(0)}B`;
    if (data < 1024 * 1024) return `${(data / 1024).toFixed(0)}K`;
    if (data < 1024 * 1024 * 1024) return `${(data / 1024 / 1024).toFixed(1)}M`;
    if (data < 1024 * 1024 * 1024 * 1024) return `${(data / 1024 / 1024 / 1024).toFixed(2)}G`;
    return `${(data / 1024 / 1024 / 1024 / 1024).toFixed(2)}T`;
  });

  const formatByte = computed(() => (data: number): string => {
    if (data < 1024) return `${data.toFixed(0)} B`;
    if (data < 1024 * 1024) return `${(data / 1024).toFixed(2)} KiB`;
    if (data < 1024 * 1024 * 1024) return `${(data / 1024 / 1024).toFixed(2)} MiB`;
    if (data < 1024 * 1024 * 1024 * 1024) return `${(data / 1024 / 1024 / 1024).toFixed(2)} GiB`;
    return `${(data / 1024 / 1024 / 1024 / 1024).toFixed(2)} TiB`;
  });

  return {
    getStatus,
    getNetworkProtocol,
    getLoad,
    getCpuStatus,
    getRAMStatus,
    getHDDStatus,
    getProcessBarStatus,
    getUpTime,
    formatNetwork,
    formatByte
  };
};
