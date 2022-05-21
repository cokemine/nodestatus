<template>
  <the-header />
  <the-error v-show="!servers" />
  <div class="container">
    <servers-table :servers="servers" />
    <update-time :updated="updated" />
    <servers-card :servers="servers" />
  </div>
  <the-footer />
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeUnmount } from 'vue';

import TheError from '@nodestatus/web-utils/vue/components/TheError.vue';
import UpdateTime from '@nodestatus/web-utils/vue/components/UpdateTime.vue';
import TheHeader from './components/TheHeader.vue';
import ServersTable from './components/ServersTable.vue';
import ServersCard from './components/ServersCard.vue';
import TheFooter from './components/TheFooter.vue';
import type { ServerItem } from './types';

/* Semantic UI Style */
import 'semantic-ui-css/semantic.min.css';

export default defineComponent({
  name: 'App',
  components: {
    TheHeader,
    TheError,
    ServersTable,
    ServersCard,
    TheFooter,
    UpdateTime
  },
  setup() {
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
    return {
      servers,
      updated
    };
  }
});
</script>

<style>
body {
  /* Replace your background image at this place! */
  background: url('./assets/img/bg_parts.png') repeat-y left top, url('./assets/img/bg.png') repeat left top;
}

/* Global */
div.bar {
  min-width: 0 !important;
}

/* Responsive */
@media only screen and (min-width: 1200px) {
  .container {
    margin: 0 auto;
    width: 1155px;
  }
}

@media only screen and (max-width: 1200px) {
  #app .container {
    margin: 0 .8rem;
    width: auto;
  }

  #table thead tr th,
  #table tr.tableRow td {
    padding: .7em;
  }
}

@media only screen and (max-width: 1075px) {
  #type,
  tr td:nth-child(3) {
    display: none;
  }
}

@media only screen and (max-width: 992px) {
  html,
  body {
    font-size: 13px;
  }
}

@media only screen and (max-width: 910px) {
  #location,
  tr td:nth-child(4) {
    display: none;
  }
}

@media (max-width: 768px) {
  html,
  body {
    font-size: 12px;
  }

  #servers div.progress {
    width: 40px;
  }

  #cards .card .card__header span {
    font-size: 1.5rem;
  }

  #cards .card .card__content p {
    margin-bottom: .6rem;
    font-size: 1.2rem;
  }

  #app #header {
    height: 20rem;

    /* Replace your header image (for mobile use) at this place! */
    background: url('assets/img/cover_mobile.png') no-repeat center center !important;
  }
}

@media only screen and (max-width: 720px) {
  #uptime,
  tr td:nth-child(5) {
    display: none;
  }
}

@media only screen and (max-width: 660px) {
  #load,
  tr td:nth-child(6) {
    display: none;
  }
}

@media only screen and (max-width: 600px) {
  #traffic,
  tr td:nth-child(8) {
    display: none;
  }
}

@media only screen and (max-width: 533px) {
  #name,
  tr td:nth-child(2) {
    overflow: hidden;
    min-width: 20px;
    max-width: 60px;
    text-overflow: ellipsis;
  }

  #hdd,
  tr td:nth-child(11) {
    display: none;
  }

  #cpu,
  #ram {
    min-width: 20px;
    max-width: 40px;
  }
}
</style>
