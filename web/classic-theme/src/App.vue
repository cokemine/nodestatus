<template>
  <the-header />
  <div class="container content">
  <servers-table :servers="servers" />
  <UpdateTime :updated="updated"/>
  </div>
  <the-footer />
</template>

<script lang="ts" setup>
import { onBeforeUnmount, ref } from 'vue';
import TheHeader from './components/TheHeader.vue';
import TheFooter from './components/TheFooter.vue';
import ServersTable from './components/ServersTable.vue';
import UpdateTime from './components/UpdateTime.vue';
import type { ServerItem } from './types';

const servers = ref<Array<ServerItem>>();
const updated = ref<number>();
const ws = new WebSocket(`${document.location.protocol.replace('http', 'ws')}${window.location.host}/public`);
ws.onopen = () => console.info('Connect to backend successfully!');
ws.onclose = () => console.warn('WebSocket disconnected!');
ws.onerror = () => console.error('An error occurred while connecting to the backend');
ws.onmessage = evt => {
  const data = JSON.parse(evt.data);
  servers.value = data.servers;
  updated.value = data.updated;
};
onBeforeUnmount(ws.close);
</script>

<style>
body {
  /* Replace your background image at this place! */
  padding-top: 70px;
  padding-bottom: 30px;
  background: #ebebeb url('./assets/img/light.png');
}
.content {
  background: #ffffff;
  padding: 20px;
  border-radius: 5px;
  border: 1px #cecece solid;
  -webkit-box-shadow: 0 1px 10px rgba(0, 0, 0, .1);
  -moz-box-shadow: 0 1px 10px rgba(0, 0, 0, .1);
  box-shadow: 0 1px 10px rgba(0, 0, 0, .1);
  margin-bottom: 20px;
}
</style>
