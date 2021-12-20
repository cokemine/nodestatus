<template>
  <tr>
    <td class="online_status">
      <div class="progress">
        <div style="width: 100%;" :class="`progress-bar progress-bar-${getStatus ? 'success' : 'danger'}`">
          <small>{{ getStatus ? getNetworkProtocol : '维护中' }}</small>
        </div>
      </div>
    </td>
    <td class="name">{{ server.name }}</td>
    <td class="type">{{ server.type }}</td>
    <td class="location">{{ server.location }}</td>
    <td class="uptime">{{ getUpTime }}</td>
    <td class="load">{{ getStatus ? getLoad : '-' }}</td>
    <td class="network">{{
        getStatus
            ? `${formatNetwork(server.status.network_rx)} | ${formatNetwork(server.status.network_tx)}`
            : '–'
      }}
    </td>
    <td class="traffic">{{
        getStatus
            ? `${formatNetwork(server.status.network_in)} | ${formatNetwork(server.status.network_out)}`
            : '–'
      }}
    </td>
    <td class="cpu">
      <div class="progress">
        <div :class="`progress-bar progress-bar-${getProcessBarStatus(getCpuStatus)}`"
            :style="{'width': `${getCpuStatus.toString()}%`}">
          <small>{{ getStatus ? `${getCpuStatus.toString()}%` : '维护中' }}</small></div>
      </div>
    </td>
    <td class="memory">
      <div class="progress">
        <div :class="`progress-bar progress-bar-${getProcessBarStatus(getRAMStatus)}`"
            :style="{'width': `${getRAMStatus.toString()}%`}">
          <small>{{ getStatus ? `${getRAMStatus.toString()}%` : '维护中' }}</small></div>
      </div>
    </td>
    <td class="hdd">
      <div class="progress">
        <div :class="`progress-bar progress-bar-${getProcessBarStatus(getHDDStatus)}`"
            :style="{'width': `${getHDDStatus.toString()}%`}">
          <small>{{ getStatus ? `${getHDDStatus.toString()}%` : '维护中' }}</small></div>
      </div>
    </td>
  </tr>
</template>

<script lang="ts" setup>
import { PropType, computed } from 'vue';
import useStatus from '@nodestatus/web-utils/vue/hooks/useStatus';
import type { ServerItem } from '../types';
// eslint-disable-next-line no-undef
const props = defineProps({
  server: {
    type: Object as PropType<ServerItem>,
    default: () => ({ status: {} })
  }
});
const {
  getStatus,
  getLoad,
  getNetworkProtocol,
  getCpuStatus,
  getRAMStatus,
  getHDDStatus,
  getProcessBarStatus: GetProcessBarStatus,
  getUpTime,
  formatNetwork,
  formatByte
} = useStatus(props);

// patch
const getProcessBarStatus = computed(
  () => (data: number) => {
    const value = GetProcessBarStatus.value(data);
    return value === 'error'
      ? 'danger'
      : value;
  }
);
</script>

<style>
.progress {
  margin-bottom: 0;
}

.progress-bar {
  color: #000;
}

.table-hover > tbody > tr:hover > td {
  background: #E6E6E6;
}

tr.even.expandRow > :hover {
  background: #F9F9F9 !important;
}

tr.odd.expandRow > :hover {
  background: #FFF !important;
}

.expandRow > td {
  padding: 0 !important;
  border-top: 0px !important;
}
</style>
