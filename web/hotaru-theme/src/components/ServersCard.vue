<script lang="ts">
import type { PropType } from 'vue';
import type { ServerItem } from '../types';
import { defineComponent } from 'vue';
import CardItem from './CardItem.vue';

export default defineComponent({
  name: 'ServersCard',
  components: {
    CardItem,
  },
  props: {
    servers: Array as PropType<Array<ServerItem>>,
  },
});
</script>

<template>
  <div id="cards">
    <div class="ui doubling three column grid">
      <CardItem v-for="server of servers" :key="server.id" :server="server" />
    </div>
  </div>
</template>

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
