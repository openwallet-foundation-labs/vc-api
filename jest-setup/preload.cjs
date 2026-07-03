// Preloaded via NODE_OPTIONS --require (see the test scripts), OUTSIDE jest's
// module sandbox. The askar packages register native (koffi) types that are
// process-global and must only ever be loaded once per worker process, while
// jest re-executes modules once per test file. The instances are stashed on
// globalThis and handed back to every jest module registry by the shims in
// this directory (wired up through moduleNameMapper).
const { createRequire } = require('node:module');
const path = require('node:path');

// Resolve from the package the tests run in (process.cwd()); tests/e2e only
// has askar transitively, so fall back to resolving through the app package.
const bases = [path.join(process.cwd(), 'noop.js')];
try {
  const cwdRequire = createRequire(bases[0]);
  bases.push(cwdRequire.resolve('@energyweb/ssi-vc-api/package.json'));
} catch {
  // the app package is not a dependency here; cwd resolution must work
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
