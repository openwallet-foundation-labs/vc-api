/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { Presentation } from './presentation';

/**
 * A JSON-LD Verifiable Presentation with a proof.
 * https://w3c-ccg.github.io/vc-api/verifier.html#operation/verifyPresentation
 */
export interface VerifiablePresentation extends Presentation {
  /**
   * A JSON-LD Linked Data proof.
   */
  proof: Record<string, unknown>;
}
