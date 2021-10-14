<template>
  <div id="cards">
    <div class="ui doubling three column grid">
      <CardItem v-for="server of servers" :key="server.id" :server="server" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import CardItem from './CardItem.vue';
import type { ServerItem } from '../types';

export default defineComponent({
  name: 'ServersCard',
  props: {
    servers: Array as PropType<Array<ServerItem>>
  },
  components: {
    CardItem
  }
});
</script>

<style>
#cards {
  padding-top: 3.4rem;
  padding-bottom: 3.5rem;
}

@media only screen and (max-width: 767px) {
  #cards .column {
    width: 100% !important;
    margin: 0 auto !important;
  }
}
</style>
