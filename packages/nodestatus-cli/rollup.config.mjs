import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import del from 'rollup-plugin-delete';
import pkg from './package.json' with { type: 'json' };

export default {
  input: 'index.js',
  output: {
    file: './build/bundle.js',
    format: 'cjs'
  },
  external: Object.keys(pkg.dependencies),
  plugins: [
    del({ targets: 'build/*' }),
    nodeResolve({ preferBuiltins: true }),
    commonjs(),
    json()
  ]
};
