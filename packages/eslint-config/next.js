import { globalIgnores } from 'eslint/config';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';
import pluginNext from '@next/eslint-plugin-next';
import { config as baseConfig } from './base.js';

/**
 * Configuração de ESLint para projetos Next.js.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const nextJsConfig = [
  ...baseConfig,
  globalIgnores([
    // Ignores padrão do Next.js
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    plugins: {
      '@next/next': pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,
    },
  },
  {
    plugins: {
      'react-hooks': pluginReactHooks,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,

      // React - JSX não precisa de import (novo transform)
      'react/react-in-jsx-scope': 'off',

      // React - Melhores práticas
      'react/prop-types': 'off',
      'react/jsx-no-target-blank': ['error', { enforceDynamicLinks: 'always' }],
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      'react/jsx-boolean-value': ['error', 'never'],
      'react/self-closing-comp': ['error', { component: true, html: true }],
      'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
      'react/jsx-pascal-case': ['error', { allowAllCaps: true }],
      'react/no-array-index-key': 'warn',
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Next.js específico - imports de imagem
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Node.js builtins
            ['^node:'],
            // React e Next.js primeiro
            ['^react', '^next'],
            // Pacotes externos
            ['^@?\\w'],
            // Imports internos do monorepo
            ['^@marquei/'],
            // Imports relativos de pai (..)
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // Imports relativos do mesmo nível (.)
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            // Imports de estilos
            ['^.+\\.s?css$'],
          ],
        },
      ],
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '.turbo/**', '.next/**'],
  },
];
