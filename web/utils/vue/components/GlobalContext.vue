<template>
  <slot></slot>
</template>

<script lang="ts" setup>
import {
  provide, onBeforeMount, ref, computed
} from 'vue';
import ky from 'ky';
import { useHead } from '@vueuse/head';
import type { IWebConfig } from '../../types';

const config = ref<IWebConfig>({
  title: '',
  subTitle: '',
  headTitle: ''
});

onBeforeMount(() => {
  ky.get('/api/config').json<IWebConfig>().then(data => {
    config.value = data;
  });
});

useHead({
  title: computed(() => config.value.headTitle),
  meta: [
    {
      name: 'description',
      content: computed(() => config.value.subTitle)
    }
  ]
});

provide('config', config);
</script>
