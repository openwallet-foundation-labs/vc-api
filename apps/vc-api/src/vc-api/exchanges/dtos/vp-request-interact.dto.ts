/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { VpRequestInteractServiceDto } from './vp-request-interact-service.dto';
import { ApiProperty } from '@nestjs/swagger';

/**
 * https://w3c-ccg.github.io/vp-request-spec/#interaction-types
 */
export class VpRequestInteractDto {
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => VpRequestInteractServiceDto)
  @ApiProperty({ type: VpRequestInteractServiceDto, isArray: true })
  service: VpRequestInteractServiceDto[];
}
