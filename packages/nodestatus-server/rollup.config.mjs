import esbuild from 'rollup-plugin-esbuild';
import del from 'rollup-plugin-delete';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import run from '@rollup/plugin-run';
import pkg from './package.json' assert { type: 'json' };

const isProd = process.env.ROLLUP_WATCH !== 'true';

const deps = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.optionalDependencies)];

const external = isProd
  ? deps
  : [...deps, ...Object.keys(pkg.devDependencies)];

export default {
  input: isProd ? './server/app.ts' : './server/app.dev.ts',
  output: {
    dir: './build',
    format: 'es',
    sourcemap: !isProd
  },
  context: 'global',
  external,
  plugins: [
    del({ targets: 'build/*' }),
    esbuild({
      target: 'es2022'
    }),
    nodeResolve({ preferBuiltins: true }),
    commonjs({ sourceMap: !isProd }),
    json(),
    !isProd && run()
  ]
};
