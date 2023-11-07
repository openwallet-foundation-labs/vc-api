/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { VerifiableCredentialDto } from './verifiable-credential.dto';
import { IsStringOrStringArray } from './custom-class-validator/is-string-or-string-array';
import { Presentation } from '../../exchanges/types/presentation';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * A JSON-LD Verifiable Presentation without a proof.
 * https://w3c-ccg.github.io/vc-api/holder.html#operation/provePresentation
 */
export class PresentationDto implements Presentation {
  @IsArray()
  @ApiProperty({
    description: 'The JSON-LD context of the presentation.',
    type: 'array',
    items: { oneOf: [{ type: 'string' }, { type: 'object' }] }
  })
  '@context': Array<string | Record<string, unknown>>;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'The ID of the presentation. ' +
      'The id property is optional and MAY be used to provide a unique identifier for the presentation. ' +
      'https://www.w3.org/TR/vc-data-model/#presentations-0'
  })
  id?: string;

  @IsStringOrStringArray()
  @ApiProperty({ description: 'The JSON-LD type of the presentation.' })
  type: string[];

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'The holder - will be ignored if no proof is present since there is no proof of authority over the credentials'
  })
  holder?: string;

  @ValidateNested({ each: true })
  @Type(() => VerifiableCredentialDto)
  @IsArray()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The Verifiable Credentials',
    type: VerifiableCredentialDto,
    isArray: true
  })
  verifiableCredential?: VerifiableCredentialDto[];
}
