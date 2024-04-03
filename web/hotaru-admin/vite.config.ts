import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import unocss from 'unocss/vite';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

export default defineConfig({
  base: '/admin/',
  plugins: [
    react(),
    unocss(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(__dirname, '../utils/assets/img/client')],
      symbolId: '[name]'
    })
  ]
});
