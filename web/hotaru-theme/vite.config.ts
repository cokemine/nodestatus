import { fileURLToPath } from 'url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

export default defineConfig({
  plugins: [
    vue(),
    createSvgIconsPlugin({
      iconDirs: [fileURLToPath(new URL('../utils/assets/img/client', import.meta.url))],
      symbolId: '[name]'
    })
  ]
});
