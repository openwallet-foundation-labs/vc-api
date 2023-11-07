/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { IProof } from '@sphereon/pex';
import { Credential } from './credential';

/**
 * A JSON-LD Verifiable Credential with a proof.
 * https://w3c-ccg.github.io/vc-api/issuer.html#operation/issueCredential
 */
export interface VerifiableCredential extends Credential {
  /**
   * A JSON-LD Linked Data proof.
   */
  proof: Record<string, unknown> | IProof;
}
