import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import esbuild from 'rollup-plugin-esbuild';
import del from 'rollup-plugin-delete';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import run from '@rollup/plugin-run';
import pkg from './package.json' assert { type: 'json' };

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

const isProd = process.env.ROLLUP_WATCH !== 'true';

const deps = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.optionalDependencies)];

const external = isProd
  ? deps
  : [...deps, ...Object.keys(pkg.devDependencies)];

export default {
  input: isProd ? './server/app.ts' : './server/app.dev.ts',
  output: {
    dir: './build',
    format: 'cjs',
    sourcemap: !isProd
  },
  context: 'global',
  external,
  plugins: [
    del({ targets: 'build/*' }),
    esbuild({
      target: 'es2020'
    }),
    alias({
      entries: [
        { find: 'ws', replacement: resolve(__dirname, 'node_modules/ws/index.js') },
      ]
    }),
    nodeResolve({ preferBuiltins: true }),
    commonjs({ sourceMap: !isProd }),
    json(),
    !isProd && run()
  ]
};
