<template>
  <table class="table table-striped table-condensed table-hover" id="table">
    <thead>
    <tr>
      <th id="online_status" style="text-align: center;">协议</th>
      <th id="name">节点名</th>
      <th id="type">虚拟化</th>
      <th id="location">位置</th>
      <th id="uptime">在线时间</th>
      <th id="load">负载</th>
      <th id="network">网络 ↓|↑</th>
      <th id="traffic">流量 ↓|↑</th>
      <th id="cpu">CPU</th>
      <th id="ram">内存</th>
      <th id="hdd">硬盘</th>
      <th id="ping" style="display:none">丢包率(CU|CT|CM)</th>
    </tr>
    </thead>
    <tbody id="servers">
    <!-- Servers here \o/ -->
    <table-item v-for="(server,index) of servers" :key="server.id" :server="server" :order="index" />
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import TableItem from './TableItem.vue';
import type { ServerItem } from '../types';

defineProps({
  servers: {
    type: Array as PropType<Array<ServerItem>>,
    default: () => []
  }
});
</script>

<style>
#table {
  background: #ffffff;
  margin-bottom: 0;
  border-collapse: collapse;
  border-radius: 3px;
}

#table th, #table td {
  text-align: center;
}

#table tbody > tr.even {
  background-color: #FFF;
}

#table tbody > tr.odd {
  background-color: #F9F9F9;
}
</style>
