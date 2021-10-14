module.exports = {
  extends: [require.resolve('../../.eslintrc')],
  overrides: [
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
      plugins: ['vue'],
      extends: ['plugin:vue/vue3-essential', 'airbnb/base', 'airbnb-typescript/base'],
      parserOptions: {
        parser: '@typescript-eslint/parser',
        project: './tsconfig.json',
        extraFileExtensions: ['.vue']
      },
      settings: {
        'import/resolver': {
          'eslint-import-resolver-custom-alias': {
            alias: {
              '@': './src'
            },
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.vue']
          }
        }
      },
      rules: {
        'import/no-extraneous-dependencies': 'off',
        'import/order': [1, {
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal'
            }
          ],
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
          'newlines-between': 'always'
        }
        ]
      }
    }
  ]
};
