/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: 'tsconfig.json'
  },
  extends: ['@energyweb'],
  env: {
    es2021: true,
    node: true,
    jest: true
  },
  ignorePatterns: ['.eslintrc.js']
};
