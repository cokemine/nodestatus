import { createHead } from '@vueuse/head';
import { createApp } from 'vue';
import App from './App.vue';
import 'virtual:svg-icons-register';

const head = createHead();

createApp(App).use(head).mount('#app');
