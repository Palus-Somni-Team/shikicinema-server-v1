// @ts-check
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['eslint.config.mjs'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      sourceType: 'commonjs',
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      indent: 'off',
      '@typescript-eslint/indent': ['error', 4, {
        ignoredNodes: ['PropertyDefinition[decorators]'],
      }],
      quotes: ['error', 'single'],
      'comma-dangle': ['error', 'always-multiline'],
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts', '**/test/**'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
);