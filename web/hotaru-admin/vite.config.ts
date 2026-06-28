import path from 'node:path';
import react from '@vitejs/plugin-react';
import unocss from 'unocss/vite';
import { defineConfig } from 'vite';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

export default defineConfig({
  base: '/admin/',
  plugins: [
    react(),
    unocss({
      configFile: path.resolve(__dirname, 'uno.config.ts'),
    }),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(__dirname, '../utils/assets/img/client')],
      symbolId: '[name]',
    }),
  ],
});
