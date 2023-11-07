/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsString, ValidateNested } from 'class-validator';
import { ProvePresentationOptionsDto } from './prove-presentation-options.dto';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO which contains DID holder to authenticate and options
 */
export class AuthenticateDto {
  @IsString()
  @ApiProperty()
  did: string;

  @ValidateNested()
  @Type(() => ProvePresentationOptionsDto)
  @ApiProperty()
  options: ProvePresentationOptionsDto;
}
