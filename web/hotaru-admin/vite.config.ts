import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import viteSvgIcons from 'vite-plugin-svg-icons';


export default defineConfig({
  base: '/admin/',
  plugins: [
    react(),
    // viteSvgIcons({
    //   iconDirs: [path.resolve(__dirname, './src/assets/img/client')],
    //   symbolId: '[name]'
    // })
  ]
});
