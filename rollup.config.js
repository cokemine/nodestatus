import { resolve } from 'path';
import typescript from 'rollup-plugin-typescript2';
import del from 'rollup-plugin-delete';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import run from '@rollup/plugin-run';

export default [
  {
    input: './server/bin/status-cli.js',
    output: {
      file: './build/bin/status-cli.js',
      format: 'cjs'
    },
    external: [ 'readable-stream', 'figlet' ],
    plugins: [
      del({ targets: 'build/*' }),
      nodeResolve({ preferBuiltins: true }),
      commonjs(),
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
    external: [ 'webpack', 'koa-webpack', 'sqlite3', 'sequelize', 'sequelize-typescript', 'reflect-metadata' ],
    plugins: [
      typescript(),
      alias({
        entries: [
          { find: 'ws', replacement: resolve(__dirname, 'node_modules/ws/index.js') }
        ]
      }),
      nodeResolve({ preferBuiltins: true }),
      commonjs(),
      json(),
      process.env.ROLLUP_WATCH === 'true' && run()
    ]
  }
];
