<template>
  <the-header />
  <div class="main container content">
    <the-error v-show="!servers" />
    <servers-table :servers="servers" />
    <UpdateTime :updated="updated" style="padding: 10px" />
  </div>
  <the-footer />
</template>

<script lang="ts" setup>
import { onBeforeUnmount, ref } from 'vue';
import TheError from '@nodestatus/web-utils/vue/components/TheError.vue';
import UpdateTime from '@nodestatus/web-utils/vue/components/UpdateTime.vue';
import TheHeader from './components/TheHeader.vue';
import TheFooter from './components/TheFooter.vue';
import ServersTable from './components/ServersTable.vue';
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
  background: #ebebeb url('./assets/img/light.png');
}

.main.content {
  background: #ffffff;
  padding: 1.4rem;
  border-radius: 5px;
  border: 1px #cecece solid;
  box-shadow: 0 1px 10px rgba(0, 0, 0, .1);
  margin-bottom: 20px;
}

/* Responsive */

@media only screen and (max-width: 1080px) {
  .type, #type,
  .uptime, #uptime {
    display: none;
  }
}

@media only screen and (max-width: 768px) {
  body {
    font-size: 12px;
  }

  .main.container {
    margin: 0 .35rem 1.3rem .35rem;
  }

  .progress {
    width: 40px;
  }
}

@media only screen and (max-width: 720px) {
  .main .expandRow td > div {
    max-height: 5rem;
  }
}

@media only screen and (max-width: 620px) {
  .location, #location {
    display: none;
  }
}

@media only screen and (max-width: 533px) {
  .traffic, #traffic {
    display: none;
  }
}

@media only screen and (max-width: 450px) {
  .name, #name {
    min-width: 20px;
    max-width: 50px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    text-align: left;
  }
}

@media only screen and (max-width: 400px) {
  body {
    font-size: 10px;
  }

  small {
    font-size: 80%;
  }
}

</style>
