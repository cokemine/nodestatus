<template>
  <div class="updated">最后更新: {{ timeSince }}</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
  updated: Number
});

const timeSince = computed((): string => {
  const nowTime: number = Date.now() / 1000;
  if (!props.updated) return '从未.';
  const seconds: number = Math.floor(nowTime - props.updated);
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return `${interval} 年前.`;
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `${interval} 月前.`;
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `${interval} 日前.`;
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `${interval} 小时前.`;
  interval = Math.floor(seconds / 60);
  if (interval > 1) return `${interval} 分钟前.`;
  /* if(Math.floor(seconds) >= 5)
          return Math.floor(seconds) + " seconds"; */
  return '几秒前.';
});
</script>

<style>
.updated {
  margin-bottom: -15px;
  margin-left: 5px;
}
</style>
