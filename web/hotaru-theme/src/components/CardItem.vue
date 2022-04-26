<template>
  <div class="column">
    <div class="ui fluid card">
      <div class="card__header">
        <svg viewBox="0 0 100 100" class="flag-icon">
          <use :xlink:href="`#${server.region}`"></use>
        </svg>
        <span> {{ server.name }} </span>
        <p>{{ server.type }}</p>
      </div>
      <div class="ui tiny progress success">
        <div class="bar" :style="{width: getStatus ? `${getRAMStatus.toString()}%` : '0%'}">
        </div>
      </div>
      <div class="card__content">
        <p>Network: {{
            `${formatNetwork(server.status.network_rx)} | ${formatNetwork(server.status.network_tx)}`
          }}</p>
        <p>负载状态: {{ getStatus ? getLoad : 'Offline' }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import useStatus from '@nodestatus/web-utils/vue/hooks/useStatus';
import type { ServerItem } from '../types';

export default defineComponent({
  name: 'CardItem',
  props: {
    server: {
      type: Object as PropType<ServerItem>,
      default: () => ({ status: {} })
    }
  },
  setup(props) {
    const {
      getStatus, getLoad, getRAMStatus, formatNetwork
    } = useStatus(props);
    return {
      getStatus,
      getLoad,
      getRAMStatus,
      formatNetwork
    };
  }
});
</script>

<style scoped>
.card {
  padding: 1.5rem;
  box-shadow: 5px 5px 25px 0 rgba(46, 61, 73, .2);
  border-radius: .5rem;
  background-color: rgba(255, 255, 255, .8);
}

.card .card__header span {
  font-size: 1.25rem;
  font-weight: normal;
  vertical-align: middle;
}

.card .card__header p {
  color: #919699;
}

.card .card__content p {
  margin-bottom: 0;
}

.card .progress {
  margin: 1.2em 0;
  overflow: hidden;
}

.flag-icon {
  display: inline;
  vertical-align: middle;
  width: 70px;
  margin-right: 8px;
}
</style>
