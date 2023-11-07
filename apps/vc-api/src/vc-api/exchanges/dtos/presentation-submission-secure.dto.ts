/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { VerificationResultDto } from '../../credentials/dtos/verification-result.dto';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Secure Presentation Submission Dto
 * A representation of a presentation submission which does not have personal data associated with the submission
 */
export class PresentationSubmissionSecureDto {
  /**
   * The result of the verification of the submitted VP
   */
  @ValidateNested()
  @Type(() => VerificationResultDto)
  verificationResult: VerificationResultDto;
}
