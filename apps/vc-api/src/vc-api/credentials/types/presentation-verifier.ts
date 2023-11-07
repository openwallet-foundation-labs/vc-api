/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { VerifiablePresentation } from '../../exchanges/types/verifiable-presentation';
import { VerificationResult } from './verification-result';
import { VerifyOptions } from './verify-options';

export interface PresentationVerifier {
  verifyPresentation: (vp: VerifiablePresentation, options: VerifyOptions) => Promise<VerificationResult>;
}
