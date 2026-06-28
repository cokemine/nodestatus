import antfu from '@antfu/eslint-config';
import ts from 'typescript-eslint';

export default antfu(
  {
    // Enable stylistic formatting rules with semicolons
    stylistic: {
      semi: true,
    },

    // Enable typescript, react and vue support
    typescript: true,
    react: true,
    vue: true,

    // Global ignores
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/.git/**',
      '**/*.timestamp-*.mjs',
      '**/bin/**',
    ],
  },
  // Custom overrides for backend packages to disable react rules
  {
    files: [
      'packages/nodestatus-server/**/*.ts',
      'packages/nodestatus-cli/**/*.ts',
      'scripts/**/*.js',
    ],
    rules: {
      'react/rules-of-hooks': 'off',
      'react/no-unnecessary-use-prefix': 'off',
    },
  },
  // Custom rule overrides for the entire workspace
  {
    plugins: {
      '@typescript-eslint': ts.plugin,
    },
    rules: {
      // Disable stylistic checks that conflict
      'style/max-statements-per-line': 'off',

      // Node/process globals
      'node/prefer-global/process': 'off',
      'node/prefer-global/buffer': 'off',

      // Top level await is used in app.dev.ts / app.ts
      'antfu/no-top-level-await': 'off',

      // React refresh / components rules
      'react-refresh/only-export-components': 'off',
      'react/prop-types': 'off',
      'react/set-state-in-effect': 'off',
      'react/no-clone-element': 'off',
      'react/no-unnecessary-use-prefix': 'off',

      // General safety and style overrides
      'unicorn/error-message': 'off',
      'array-callback-return': 'off',
      'no-console': 'off',

      // Allow legacy rules to be parsed in comments
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
);
