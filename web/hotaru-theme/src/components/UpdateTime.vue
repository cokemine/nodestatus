<template>
  <div class="updated">最后更新: {{ timeSince }}</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import useUpTime from '@nodestatus/web-utils/vue/hooks/useUpTime';

export default defineComponent({
  name: 'UpdateTime',
  props: {
    updated: Number
  },
  setup(props) {
    const { timeSince } = useUpTime(props as any);
    return {
      timeSince
    };
  }
});
</script>

<style>
.updated {
  margin-bottom: -15px;
  margin-left: 5px;
}
</style>
