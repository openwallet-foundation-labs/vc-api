/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class PresentationDefinitionDto {
  @IsString()
  @ApiProperty()
  id: string;

  @IsArray()
  @ApiProperty({ type: 'object', isArray: true })
  // TODO: consider defining DTO and validations
  input_descriptors: Record<any, unknown>[];
}
