import { defineConfig } from 'rolldown';
import del from 'rollup-plugin-delete';
import pkg from './package.json' with { type: 'json' };

export default defineConfig({
  input: 'index.js',
  output: {
    file: './build/bundle.js',
    format: 'cjs',
  },
  external: Object.keys(pkg.dependencies),
  plugins: [
    del({ targets: 'build/*' }),
  ],
});
