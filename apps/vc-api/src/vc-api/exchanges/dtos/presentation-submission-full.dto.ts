/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { VerificationResultDto } from '../../credentials/dtos/verification-result.dto';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { VerifiablePresentationDto } from '../../credentials/dtos/verifiable-presentation.dto';
import { Type } from 'class-transformer';

/**
 * Presentation Submission Full Dto.
 * The complete presentation submission, including the submitted Verifiable Presentation
 */
export class PresentationSubmissionFullDto {
  /**
   * The result of the verification of the submitted VP
   */
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => VerificationResultDto)
  verificationResult: VerificationResultDto;

  /**
   * The Verifiable Presentation submitted in response to the transaction's VP Request
   */
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => VerifiablePresentationDto)
  vp: VerifiablePresentationDto;
}
