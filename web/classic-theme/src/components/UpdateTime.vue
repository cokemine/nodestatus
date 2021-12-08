<template>
  <div class="updated">最后更新: {{ timeSince }}</div>
</template>

<script lang="ts" setup>
import useUpTime from '@nodestatus/web-utils/hooks/useUpTime';
// eslint-disable-next-line no-undef
const props = defineProps({
  updated: Number
});
const { timeSince } = useUpTime(props as any);
</script>

<style>
.updated {
  margin-bottom: -15px;
  margin-left: 5px;
}
</style>
