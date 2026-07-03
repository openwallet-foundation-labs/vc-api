// moduleNameMapper target for 'webcrypto-core' under jest - returns the
// singleton (CJS build) loaded by preload.cjs
if (!globalThis.__webcryptoCore) {
  throw new Error(
    'webcrypto-core preload missing: run jest with NODE_OPTIONS including --require <repo>/jest-setup/preload.cjs'
  );
}
module.exports = globalThis.__webcryptoCore;
