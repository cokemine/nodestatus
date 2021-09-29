module.exports = {
  root: true,
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:import/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['import'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    'max-len': ['error', 120, 2, {
      ignoreUrls: true,
      ignoreComments: false,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
    }],
    indent: [1, 2],
    semi: [1, 'always'],
    quotes: [1, 'single'],
    'eol-last': [2, 'always'],
    'quote-props': [2, 'as-needed', { keywords: false, unnecessary: true, numbers: false }],
    'brace-style': [1, '1tbs'],
    'template-curly-spacing': [2, 'never'],
    'object-curly-spacing': [2, 'always'],
    'array-bracket-spacing': [2, 'never'],
    'import/no-named-as-default': 'off',
    'import/order': [
      2,
      { groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'] }
    ],
    'require-await': 2,
    'no-return-await': 2,
  },
  overrides: [
    {
      files: ['*.{ts,tsx}'],
      extends: ['plugin:@typescript-eslint/recommended'],
      plugins: ['@typescript-eslint'],
      rules: {
        '@typescript-eslint/no-explicit-any': 0
      }
    }
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts']
      }
    }
  },
};
