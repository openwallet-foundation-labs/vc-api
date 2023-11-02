/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProofPurpose } from '@sphereon/pex';
import { IsOptional, IsString } from 'class-validator';
import { VerifyOptions } from '../types/verify-options';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Parameters for verifying a verifiable credential or a verifiable presentation
 * https://w3c-ccg.github.io/vc-api/verifier.html#operation/verifyCredential
 * https://w3c-ccg.github.io/vc-api/verifier.html#operation/verifyPresentation
 */
export class VerifyOptionsDto implements VerifyOptions {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The URI of the verificationMethod used for the proof. Default assertionMethod URI.'
  })
  verificationMethod?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: "The purpose of the proof. Default 'assertionMethod'.",
    enum: ProofPurpose,
    enumName: 'ProofPurpose'
  })
  proofPurpose?: ProofPurpose;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'The date and time of the proof (with a maximum accuracy in seconds). Default current system time.'
  })
  created?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'A challenge provided by the requesting party of the proof. For example 6e62f66e-67de-11eb-b490-ef3eeefa55f2'
  })
  challenge?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The intended domain of validity for the proof. For example website.example'
  })
  domain?: string;
}
