import path from 'path';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import viteSvgIcons from 'vite-plugin-svg-icons';

export default defineConfig({
  plugins: [
    vue(),
    viteSvgIcons({
      iconDirs: [path.resolve(__dirname, './src/assets/img/client')],
      symbolId: '[name]'
    })
  ]
});
