/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { ValidateNested } from 'class-validator';
import { PresentationDto } from './presentation.dto';
import { ProvePresentationOptionsDto } from './prove-presentation-options.dto';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO which contains presentation and options
 */
export class ProvePresentationDto {
  @ValidateNested()
  @Type(() => PresentationDto)
  @ApiProperty()
  presentation: PresentationDto;

  @ValidateNested()
  @Type(() => ProvePresentationOptionsDto)
  @ApiProperty()
  options: ProvePresentationOptionsDto;
}
