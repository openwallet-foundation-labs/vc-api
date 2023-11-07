/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProofPurpose } from '@sphereon/pex';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Options for specifying how the Data Integrity Proof is created for a credential presentation proof
 * https://w3c-ccg.github.io/vc-api/#prove-presentation
 */
export class ProvePresentationOptionsDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'The type of the proof. Default is an appropriate proof type corresponding to the verification method.'
  })
  type?: string;

  @IsString()
  @ApiProperty({
    description: 'The URI of the verificationMethod used for the proof. Default assertionMethod URI.'
  })
  verificationMethod: string;

  @IsString()
  @IsOptional()
  @IsEnum(ProofPurpose)
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

  @IsObject()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'The method of credential status to issue the credential including. If omitted credential status will be included.'
  })
  credentialStatus?: Record<string, unknown>;
}
