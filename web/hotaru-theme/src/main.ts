import { createApp } from 'vue';
import { createHead } from '@vueuse/head';
import App from './App.vue';
// eslint-disable-next-line import/no-unresolved
import 'virtual:svg-icons-register';

const head = createHead();

createApp(App).use(head).mount('#app');
