/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class IssuerDto {
  @IsString()
  @ApiProperty()
  id: string;

  constructor(properties: Partial<IssuerDto>) {
    Object.assign(this, properties);
  }
}
