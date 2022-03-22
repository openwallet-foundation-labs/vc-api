import { walletClient } from '../app.e2e-spec';

export const didSuite = () => {
  it('should create and retrieve a new did:ethr DID', async () => {
    await walletClient.createDID('ethr');
  });

  it('should create and retrieve a new did:key DID', async () => {
    await walletClient.createDID('key');
  });
};
