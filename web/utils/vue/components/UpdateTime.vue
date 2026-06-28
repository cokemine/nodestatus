<script lang="ts" setup>
import { computed } from 'vue';
import { parseUpdateTime } from '../../shared';

const props = defineProps({
  updated: Number,
});

const timeSince = computed((): string => parseUpdateTime(props.updated));
</script>

<template>
  <div class="updated">
    最后更新：{{ timeSince }}
  </div>
</template>

<style>
.updated {
  margin-bottom: -15px;
  margin-left: 5px;
}
</style>
