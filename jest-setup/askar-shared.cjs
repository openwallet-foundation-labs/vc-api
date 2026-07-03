// moduleNameMapper target for '@openwallet-foundation/askar-shared' under
// jest - returns the singleton loaded by preload.cjs
if (!globalThis.__askarShared) {
  throw new Error(
    'askar preload missing: run jest with NODE_OPTIONS including --require <repo>/jest-setup/preload.cjs'
  );
}
module.exports = globalThis.__askarShared;
