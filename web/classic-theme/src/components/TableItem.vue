<template>
  <tr id="r0" data-toggle="collapse" data-target="#rt0" class="accordion-toggle even collapsed" aria-expanded="false">
    <td id="online_status">
      <div class="progress">
        <div style="width: 100%;" class="progress-bar progress-bar-success"><small>IPv4</small></div>
      </div>
    </td>
    <td id="name">{{ server.name }}</td>
    <td id="type">{{ server.type }}</td>
    <td id="location">{{ server.location }}</td>
    <td id="uptime">{{ getUpTime }}</td>
    <td id="load">{{ server.load }}</td>
    <td id="network">{{
        getStatus
            ? `${formatNetwork(server.status.network_rx)} | ${formatNetwork(server.status.network_tx)}`
            : '–'
      }}
    </td>
    <td id="traffic">{{
        getStatus
            ? `${formatNetwork(server.status.network_in)} | ${formatNetwork(server.status.network_out)}`
            : '–'
      }}
    </td>
    <td id="cpu">
      <div class="progress">
        <div :class="`progress-bar progress-bar-${getProcessBarStatus(getCpuStatus)}`"
            :style="{'width': `${getCpuStatus.toString()}%`}">
          <small>{{ getStatus ? `${getCpuStatus.toString()}%` : '维护中' }}</small></div>
      </div>
    </td>
    <td id="memory">
      <div class="progress">
        <div :class="`progress-bar progress-bar-${getProcessBarStatus(getRAMStatus)}`"
            :style="{'width': `${getRAMStatus.toString()}%`}">
          <small>{{ getStatus ? `${getRAMStatus.toString()}%` : '维护中' }}</small></div>
      </div>
    </td>
    <td id="hdd">
      <div class="progress">
        <div :class="`progress-bar progress-bar-${getProcessBarStatus(getHDDStatus)}`"
            :style="{'width': `${getHDDStatus.toString()}%`}">
          <small>{{ getStatus ? `${getHDDStatus.toString()}%` : '维护中' }}</small></div>
      </div>
    </td>
  </tr>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import useStatus from './useStatus';
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
  getCpuStatus,
  getRAMStatus,
  getHDDStatus,
  getProcessBarStatus,
  getUpTime,
  formatNetwork,
  formatByte
} = useStatus(props);
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
