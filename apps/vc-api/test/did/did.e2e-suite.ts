/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { walletClient } from '../app.e2e-spec';

export const didSuite = () => {
  it('should create and retrieve a new did:ethr DID', async () => {
    await walletClient.createDID('ethr');
  });

  it('should create and retrieve a new did:key DID', async () => {
    await walletClient.createDID('key');
  });
};
