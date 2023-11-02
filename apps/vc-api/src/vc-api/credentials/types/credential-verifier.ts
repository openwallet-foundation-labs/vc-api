/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { VerifiableCredential } from '../../exchanges/types/verifiable-credential';
import { VerificationResult } from './verification-result';
import { VerifyOptions } from './verify-options';

export interface CredentialVerifier {
  verifyCredential: (vc: VerifiableCredential, options: VerifyOptions) => Promise<VerificationResult>;
}
