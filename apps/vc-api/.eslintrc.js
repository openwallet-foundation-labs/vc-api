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
  rules: {
    '@typescript-eslint/no-floating-promises': ['error']
  },
  ignorePatterns: ['.eslintrc.js']
};
