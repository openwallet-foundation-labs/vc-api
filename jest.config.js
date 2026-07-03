module.exports = {
  verbose: true,
  transform: {
    '\\.(ts|tsx)$': 'ts-jest',
    '\\.mjs$': 'babel-jest'
  },
  transformIgnorePatterns: ['node_modules/.+\\.!mjs$'],
  testEnvironment: 'node',
  // Pin dual (CJS+ESM) packages to their CJS build so a package is never
  // loaded in both module formats at once (which jest rejects when a
  // require() and a concurrent import() hit the same file).
  // NOTE: for this shared config, jest's <rootDir> is the package under test
  // (the directory with the package.json), not the repository root
  moduleNameMapper: {
    '^@openwallet-foundation/askar-nodejs$': '<rootDir>/../../jest-setup/askar-nodejs.cjs',
    '^@openwallet-foundation/askar-shared$': '<rootDir>/../../jest-setup/askar-shared.cjs',
    '^webcrypto-core$': '<rootDir>/../../jest-setup/webcrypto-core.cjs'
  },
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },
  collectCoverageFrom: ['src/*.{js,ts}']
};
