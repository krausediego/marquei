import globals from 'globals';
import { config as baseConfig } from './base.js';

/**
 * Configuração de ESLint para projetos Node.js (backend, scripts, etc).
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      // Node.js - Melhores práticas
      'no-process-exit': 'warn',

      // Console permitido no backend
      'no-console': 'off',

      // Promises e async/await
      'no-return-await': 'error',
      'require-await': 'warn',
      'no-promise-executor-return': 'error',

      // Imports Node.js
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Node.js builtins primeiro
            ['^node:'],
            // Pacotes externos
            ['^@?\\w'],
            // Imports internos do monorepo
            ['^@marquei/'],
            // Imports relativos de pai (..)
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // Imports relativos do mesmo nível (.)
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            // Tipos
            ['^.+\\u0000$'],
          ],
        },
      ],
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '.turbo/**'],
  },
];


