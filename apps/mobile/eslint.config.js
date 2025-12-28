import { config } from '@marquei/eslint-config/react-internal';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    ignores: ['.expo/**', 'android/**', 'ios/**'],
  },
];
