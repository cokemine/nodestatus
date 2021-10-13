<template>
  <div v-html="footer" class="footer"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TheFooter',
  setup() {
    return {
      footer: window.__PRE_CONFIG__.footer
    };
  }
});
</script>

<style>
.footer p {
  text-align: center;
  padding-bottom: 15px;
}

.footer p a {
  vertical-align: middle;
  transition: color .3s ease;
}

.footer p a:hover {
  color: #ff779a;
}
</style>
