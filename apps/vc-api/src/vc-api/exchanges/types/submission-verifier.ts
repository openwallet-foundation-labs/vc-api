/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { VerificationResult } from '../../credentials/types/verification-result';
import { VpRequestEntity } from '../entities/vp-request.entity';
import { VerifiablePresentation } from './verifiable-presentation';

/**
 * Intended to represent a verifier of a VP Request Submission.
 * TODO: Maybe shouldn't only be for VPR verification but allow for more generic types.
 */
export interface SubmissionVerifier {
  verifyVpRequestSubmission: (
    vp: VerifiablePresentation,
    vpRequest: VpRequestEntity
  ) => Promise<VerificationResult>;
}
