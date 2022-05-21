<template>
  <tr class="tableRow" @click="collapsed = !collapsed">
    <td>
      <div class="ui progress" :class="getStatus ? 'success' : 'error'">
        <div class="bar" style="width: 100%"><span> {{ getStatus ? '运行中' : '维护中' }} </span>
        </div>
      </div>
    </td>
    <td>{{ server.name }}</td>
    <td>{{ server.type }}</td>
    <td>{{ server.location }}</td>
    <td>{{ getUpTime || '–' }}</td>
    <td>{{
        getStatus
            ? getLoad
            : '-'
      }}
    </td>
    <td>{{
        getStatus
            ? `${formatNetwork(server.status.network_rx)} | ${formatNetwork(server.status.network_tx)}`
            : '–'
      }}
    </td>
    <td>{{
        getStatus
            ? `${formatNetwork(server.status.network_in)} | ${formatNetwork(server.status.network_out)}`
            : '–'
      }}
    </td>
    <td>
      <div class="ui progress" :class="getProcessBarStatus(getCpuStatus)">
        <div class="bar" :style="{'width': `${getCpuStatus.toString()}%`}">
          {{ getStatus ? `${getCpuStatus.toString()}%` : '维护中' }}
        </div>
      </div>
    </td>
    <td>
      <div class="ui progress" :class="getProcessBarStatus(getRAMStatus)">
        <div class="bar" :style="{'width': `${getRAMStatus.toString()}%`}">
          {{ getStatus ? `${getRAMStatus.toString()}%` : '维护中' }}
        </div>
      </div>
    </td>
    <td>
      <div class="ui progress" :class="getProcessBarStatus(getHDDStatus)">
        <div class="bar" :style="{'width': `${getHDDStatus.toString()}%`}">
          {{ getStatus ? `${getHDDStatus.toString()}%` : '维护中' }}
        </div>
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

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';

import useStatus from '@nodestatus/web-utils/vue/hooks/useStatus';
import type { ServerItem } from '../types';

export default defineComponent({
  name: 'TableItem',
  props: {
    server: {
      type: Object as PropType<ServerItem>,
      default: () => ({ status: {} })
    }
  },
  setup(props) {
    const collapsed = ref(true);
    const utils = useStatus(props);
    return {
      collapsed,
      ...utils
    };
  }
});
</script>

<style scoped>

.tableRow {
  background-color: rgba(249, 249, 249, .8);
  vertical-align: middle;
}

.expandRow td > div {
  overflow: hidden;
  transition: max-height .5s ease;
  max-height: 4em;
}

.expandRow td > .collapsed {
  max-height: 0;
}

.tableRow .progress {
  display: inline-block;
  overflow: hidden;
  height: 25px;
  width: 50px;
  border-radius: 6px;
  margin-bottom: 0 !important;
}

.tableRow .progress .bar {
  height: 25px;
  border-radius: 6px;
  font-size: .9rem;
  line-height: 25px;
  color: white;
}

tr td {
  color: #616366;
  font-weight: bold;
  border: none !important;
  white-space: nowrap;
}
</style>
