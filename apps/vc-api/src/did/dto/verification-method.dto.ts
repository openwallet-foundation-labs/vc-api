/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JsonWebKeyDto } from './json-web-key.dto';
import { Type } from 'class-transformer';

export class VerificationMethodDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  controller: string;

  @ApiPropertyOptional({ type: JsonWebKeyDto })
  @Type(() => JsonWebKeyDto)
  publicKeyJwk?: JsonWebKeyDto;

  constructor(partial: Partial<VerificationMethodDto>) {
    Object.assign(this, partial);
  }
}
