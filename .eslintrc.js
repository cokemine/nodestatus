module.exports = {
  root: true,
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: [ 'eslint:recommended', 'plugin:@typescript-eslint/recommended' ],
  parser: '@typescript-eslint/parser',
  plugins: [ '@typescript-eslint' ],
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
    'require-await': 2,
    'no-return-await': 2,
    '@typescript-eslint/no-explicit-any': 0
  },
  'overrides': [
    {
      'files': [ '*.js' ],
      'rules': {
        '@typescript-eslint/no-var-requires': 0
      }
    }
  ]
};
