<template>
  <tr :class="`tableRow ${(order + 1) % 2 ? 'odd' : 'even'}`" @click="collapsed = !collapsed">
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
  <tr class="expandRow">
    <td colspan="12">
      <div :class="{collapsed}" :style="{'max-height': getStatus ? '' : '0'}">
        <div>内存信息: {{
            getStatus
                ? `${formatByte(server.status.memory_used * 1024)}
                 / ${formatByte(server.status.memory_total * 1024)}`
                : '–'
          }}
        </div>
        <div>交换分区: {{
            getStatus
                ? `${formatByte(server.status.swap_used * 1024)}
                 / ${formatByte(server.status.swap_total * 1024)}`
                : '–'
          }}
        </div>
        <div>硬盘信息: {{
            getStatus
                ? `${formatByte(server.status.hdd_used * 1024 * 1024)}
                 / ${formatByte(server.status.hdd_total * 1024 * 1024)}`
                : '–'
          }}
        </div>
        <!--        <div id="expand_custom">{{server.custom}}</div>-->
      </div>
    </td>
  </tr>
</template>

<script lang="ts" setup>
import { computed, PropType, ref } from 'vue';
import useStatus from '@nodestatus/web-utils/vue/hooks/useStatus';
import type { ServerItem } from '../types';

const props = defineProps({
  server: {
    type: Object as PropType<ServerItem>,
    default: () => ({ status: {} })
  },
  order: {
    type: Number,
    required: true
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

const collapsed = ref(true);

</script>

<style>
.progress {
  display: inline-block;
  text-align: center;
  margin-bottom: 0;
  width: 50px;
}

.progress-bar {
  color: #000;
}

.tableRow td {
  vertical-align: middle !important;
}

tr.even + .expandRow {
  background-color: #FFF !important;
}

tr.odd + .expandRow {
  background: #F9F9F9 !important;
}

.expandRow > td {
  padding: 0 !important;
  border-top: 0 !important;
}

.expandRow td > div {
  overflow: hidden;
  transition: max-height .5s ease;
  max-height: 4.3em;
}

.expandRow td > div.collapsed {
  max-height: 0 !important;
}

</style>
