// Shared ESLint flat config for all workspace packages.
// Replaces the per-project .eslintrc.js files and @energyweb/eslint-config.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import noOnlyTests from 'eslint-plugin-no-only-tests';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      'eslint.config.mjs',
      '**/.prettierrc.js',
      '**/jest.config.js',
      'patches/**',
      'site/**'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    plugins: {
      'no-only-tests': noOnlyTests
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      },
      parserOptions: {
        projectService: true
      }
    },
    rules: {
      'no-only-tests/no-only-tests': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      // typescript-eslint v8 escalated this to an error; keep the previous
      // (v5 recommended) severity until the existing usages are typed
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  },
  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
    rules: {
      '@typescript-eslint/no-require-imports': 'off'
    }
  }
);
