import { resolve } from 'path';
import typescript from 'rollup-plugin-typescript2';
import del from 'rollup-plugin-delete';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import run from '@rollup/plugin-run';
import pkg from './package.json';

const isProd = process.env.ROLLUP_WATCH !== 'true';

/* WIP: babel-plugin-import */
const external = isProd
  ? [ 'readable-stream', 'figlet', 'webpack', 'koa-webpack', 'sqlite3', 'sequelize', 'sequelize-typescript', 'reflect-metadata', 'babel-plugin-import' ]
  : [ ...Object.keys(pkg.devDependencies), ...Object.keys(pkg.dependencies) ];

export default [
  {
    input: './server/bin/status-cli.js',
    output: {
      file: './build/bin/status-cli.js',
      format: 'cjs'
    },
    external,
    plugins: [
      del({ targets: 'build/*' }),
      nodeResolve({ preferBuiltins: true }),
      commonjs({ sourceMap: !isProd }),
      json(),
    ]
  },
  {
    input: './server/app.ts',
    output: {
      dir: './build',
      format: 'cjs',
    },
    context: 'global',
    external,
    plugins: [
      typescript(),
      alias({
        entries: [
          { find: 'ws', replacement: resolve(__dirname, 'node_modules/ws/index.js') }
        ]
      }),
      nodeResolve({ preferBuiltins: true }),
      commonjs({ sourceMap: !isProd }),
      json(),
      !isProd && run()
    ]
  }
];
