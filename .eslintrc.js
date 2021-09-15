module.exports = {
  root: true,
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: [ 'eslint:recommended', 'plugin:import/recommended' ],
  parser: '@typescript-eslint/parser',
  plugins: [ 'import' ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    indent: [ 1, 2 ],
    semi: [ 1, 'always' ],
    quotes: [ 1, 'single' ],
    'brace-style': [ 1, '1tbs' ],
    'object-curly-spacing': [ 1, 'always' ],
    'import/no-named-as-default': 0,
    'import/order': [ 1, { groups: [ 'builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type' ] } ],
    'require-await': 2,
    'no-return-await': 2,
  },
  overrides: [
    {
      files: [ '*.{ts,tsx}' ],
      extends: [ 'plugin:@typescript-eslint/recommended' ],
      plugins: [ '@typescript-eslint' ],
      rules: {
        '@typescript-eslint/no-explicit-any': 0
      }
    }
  ],
  'settings': {
    'import/resolver': {
      'node': {
        'extensions': [ '.js', '.jsx', '.ts', '.tsx', '.d.ts' ]
      }
    }
  },
};
