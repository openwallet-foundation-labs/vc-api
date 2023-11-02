/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsArray, IsDateString, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiExtraModels, ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import { IsIssuer } from '../../exchanges/dtos/custom-validators';
import { IssuerDto } from './issuer.dto';

/**
 * A JSON-LD Verifiable Credential without a proof.
 * https://w3c-ccg.github.io/vc-api/issuer.html#operation/issueCredential
 */
@ApiExtraModels(IssuerDto)
export class CredentialDto {
  [key: string]: unknown;

  @IsArray()
  @ApiProperty({
    description: 'The JSON-LD context of the credential.',
    type: 'array',
    items: { oneOf: [{ type: 'string' }, { type: 'object' }] }
  })
  '@context': Array<string | Record<string, unknown>>;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'The ID of the credential.' })
  id?: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'The JSON-LD type of the credential.' })
  type: string[];

  @IsIssuer()
  @ApiProperty({
    description: 'A JSON-LD Verifiable Credential Issuer.',
    oneOf: [{ $ref: getSchemaPath(IssuerDto) }, { type: 'string' }]
  })
  issuer: string | IssuerDto;

  @IsDateString()
  @ApiProperty({ description: 'The issuanceDate', example: '2022-09-21T11:49:03.205Z' })
  issuanceDate: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'The expirationDate', example: '2023-09-21T11:49:03.205Z' })
  expirationDate?: string;

  @IsObject()
  @ApiProperty({ description: 'The subject' })
  credentialSubject: Record<string, unknown>;
}
