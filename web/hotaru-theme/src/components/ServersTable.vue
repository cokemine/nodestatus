<template>
  <table class="ui basic unstackable table" id="table">
    <thead>
    <tr>
      <th id="status4">运行状态</th>
      <th id="name">节点名</th>
      <th id="type">类型</th>
      <th id="location">服务器位置</th>
      <th id="uptime">在线时间</th>
      <th id="load">负载</th>
      <th id="network">网络(B/s) ↓|↑</th>
      <th id="traffic">流量(B) ↓|↑</th>
      <th id="cpu">CPU</th>
      <th id="ram">内存</th>
      <th id="hdd">硬盘</th>
    </tr>
    </thead>
    <tbody id="servers">
    <!-- Servers here \o/ -->
    <table-item v-for="server of servers" :key="server.id" :server="server"/>
    </tbody>
  </table>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
import TableItem from '@/components/TableItem.vue';
import { ServerItem } from '@/types';

export default defineComponent({
  name: 'ServersTable',
  props: {
    servers: {
      type: Array as PropType<Array<ServerItem>>,
      default: () => ([])
    }
  },
  components: {
    TableItem
  }
});
</script>
<style>
#table {
  font-size: 1rem;
  border: none;
  text-align: center;
  vertical-align: middle;
}

#table thead tr th {
  color: #9da2a6;
  white-space: nowrap;
}
</style>
