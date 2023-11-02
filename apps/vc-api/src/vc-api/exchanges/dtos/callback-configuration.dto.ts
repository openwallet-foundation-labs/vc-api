/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsUrl } from 'class-validator';
import { CallbackConfiguration } from '../types/callback-configuration';
import { ApiProperty } from '@nestjs/swagger';

/**
 * An exchange result callback
 */
export class CallbackConfigurationDto implements CallbackConfiguration {
  @IsUrl({
    require_tld: false, //to allow localhost, see https://github.com/validatorjs/validator.js/issues/754
    require_protocol: true
  })
  @ApiProperty({
    description:
      'URL at a callback notification will be sent:\n' +
      '- when a VP is submitted to a "mediated" exchange\n' +
      '- after the exchange has completed',
    example: 'https://example.com'
  })
  url: string;
}
