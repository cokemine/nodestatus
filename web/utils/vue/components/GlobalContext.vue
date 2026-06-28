<script lang="ts" setup>
import type { IWebConfig } from '../../types';
import { useHead } from '@vueuse/head';
import ky from 'ky';
import {
  computed,
  onBeforeMount,
  provide,
  ref,
} from 'vue';

const config = ref<IWebConfig>({
  title: '',
  subTitle: '',
  headTitle: '',
});

onBeforeMount(() => {
  ky.get('/api/config').json<IWebConfig>().then((data) => {
    config.value = data;
  });
});

useHead({
  title: computed(() => config.value.headTitle),
  meta: [
    {
      name: 'description',
      content: computed(() => config.value.subTitle),
    },
  ],
});

provide('config', config);
</script>

<template>
  <slot />
</template>
