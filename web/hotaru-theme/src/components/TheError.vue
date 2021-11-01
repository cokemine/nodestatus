<template>
  <p class="error">
    若長時間出現此消息，請確保您的雲監控主服務（服務端）已啟動。
  </p>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TheError'
});
</script>
<style>
.error {
  margin-bottom: 0;
  text-align: center;
  color: #616366;
}
</style>
