/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsObject, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Options for specifying how the Data Integrity Proof is created for a credential issuance
 * https://w3c-ccg.github.io/vc-api/issuer.html#operation/issueCredential
 */
export class IssueOptionsDto {
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
