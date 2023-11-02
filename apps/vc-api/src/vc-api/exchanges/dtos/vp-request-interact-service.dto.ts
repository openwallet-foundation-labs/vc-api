/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsEnum, IsUrl } from 'class-validator';
import { VpRequestInteractServiceType } from '../types/vp-request-interact-service-type';
import { ApiProperty } from '@nestjs/swagger';

/**
 * https://w3c-ccg.github.io/vp-request-spec/#interaction-types
 */
export class VpRequestInteractServiceDto {
  @IsEnum(VpRequestInteractServiceType)
  @ApiProperty({
    enum: VpRequestInteractServiceType,
    enumName: 'VpRequestInteractServiceType'
  })
  type: VpRequestInteractServiceType;

  @IsUrl({
    require_tld: false, // to allow localhost, see https://github.com/validatorjs/validator.js/issues/754
    require_protocol: true
  })
  @ApiProperty({ description: 'URL at which the credential exchange can be continued' })
  serviceEndpoint: string;
}
