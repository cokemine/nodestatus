import { fileURLToPath } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

export default defineConfig({
  plugins: [
    vue(),
    createSvgIconsPlugin({
      iconDirs: [fileURLToPath(new URL('../utils/assets/img/client', import.meta.url))],
      symbolId: '[name]',
    }),
  ],
  build: {
    cssMinify: 'esbuild',
  },
});
