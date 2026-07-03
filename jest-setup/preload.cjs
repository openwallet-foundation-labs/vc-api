// Preloaded via NODE_OPTIONS --require (see the test scripts), OUTSIDE jest's
// module sandbox. The askar packages register native (koffi) types that are
// process-global and must only ever be loaded once per worker process, while
// jest re-executes modules once per test file. webcrypto-core is a dual
// (CJS+ESM) package that jest would otherwise load in both formats at once.
// The instances are stashed on globalThis and handed back to every jest
// module registry by the shims in this directory (wired up through
// moduleNameMapper).
const { createRequire } = require('node:module');
const path = require('node:path');

// Resolve from the package the tests run in (process.cwd()); tests/e2e only
// has the dependencies transitively, so fall back to resolving through the
// app package and through @credo-ts/core (for its own dependencies).
const bases = [path.join(process.cwd(), 'noop.js')];
for (const id of ['@energyweb/ssi-vc-api/package.json', '@credo-ts/core/package.json']) {
  for (const base of [...bases]) {
    try {
      bases.push(createRequire(base).resolve(id));
      break;
    } catch {
      // not resolvable from this base; try the next one
    }
  }
}

function requireFromBases(id) {
  let lastError;
  for (const base of bases) {
    try {
      return createRequire(base)(id);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

globalThis.__askarShared = requireFromBases('@openwallet-foundation/askar-shared');
globalThis.__askarNodeJs = requireFromBases('@openwallet-foundation/askar-nodejs');
globalThis.__webcryptoCore = requireFromBases('webcrypto-core');
