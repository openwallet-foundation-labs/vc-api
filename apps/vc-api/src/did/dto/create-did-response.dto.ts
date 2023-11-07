/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VerificationMethodDto } from './verification-method.dto';
import { Type } from 'class-transformer';

export class CreateDidResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional({ type: VerificationMethodDto, isArray: true })
  @Type(() => VerificationMethodDto)
  verificationMethod?: VerificationMethodDto[];

  constructor(partial: Partial<CreateDidResponseDto>) {
    Object.assign(this, partial);
  }
}
