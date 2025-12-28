import { config } from '@marquei/eslint-config/node';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    ignores: ['dist/**'],
  },
];
