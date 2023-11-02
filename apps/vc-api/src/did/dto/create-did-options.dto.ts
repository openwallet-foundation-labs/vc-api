/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DidMethod } from '../types/did-method';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDidOptionsDto {
  @IsEnum(DidMethod)
  @ApiProperty({
    description: 'DID Method to create.\nMust be one of "key" or "ethr"',
    enum: DidMethod,
    enumName: 'DidMethod'
  })
  method: DidMethod;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'id of key (for example, JWK thumbprint).\n' +
      'This key must be known to the server already.\n' +
      'If provided, DID will be created using this key.\n' +
      'Currently only supported for did:key.'
  })
  keyId?: string;
}
