// @ts-check

import eslint from '@eslint/js';
import eslintTs from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default eslintTs.config(
  eslint.configs.recommended,
  ...eslintTs.configs.recommended,
  {
    plugins: {
      '@stylistic': stylistic
    },
    'rules': {
      '@stylistic/semi': 'error',
      '@stylistic/quotes': ['error', 'single'],
    }
  }
);
