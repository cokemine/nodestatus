import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

export default defineConfig({
  base: '/admin/',
  plugins: [
    react(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(__dirname, '../utils/assets/img/client')],
      symbolId: '[name]'
    })
  ]
});
