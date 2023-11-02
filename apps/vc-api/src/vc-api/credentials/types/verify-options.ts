/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * See "VerifyOptions" from
 * - https://w3c-ccg.github.io/vc-api/verifier.html#operation/verifyCredential
 * - https://w3c-ccg.github.io/vc-api/verifier.html#operation/verifyPresentation
 */
export interface VerifyOptions {
  challenge?: string;
  proofPurpose?: string;
}
