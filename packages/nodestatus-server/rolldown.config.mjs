import { defineConfig } from 'rolldown';
import del from 'rollup-plugin-delete';
import run from '@rollup/plugin-run';
import pkg from './package.json' with { type: 'json' };

export default defineConfig((args) => {
  const isProd = !args.watch;

  const deps = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.optionalDependencies)];

  const external = isProd
    ? deps
    : [...deps, ...Object.keys(pkg.devDependencies)];

  return {
    input: isProd ? './server/app.ts' : './server/app.dev.ts',
    output: {
      dir: './build',
      format: 'esm',
      sourcemap: !isProd
    },
    platform: 'node',
    external,
    plugins: [
      del({ targets: 'build/*' }),
      !isProd && run()
    ]
  };
});
