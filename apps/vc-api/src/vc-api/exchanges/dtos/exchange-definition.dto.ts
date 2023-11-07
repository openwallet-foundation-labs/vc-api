/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsArray, IsBoolean, IsString, ValidateNested } from 'class-validator';
import { VpRequestQueryDto } from './vp-request-query.dto';
import { ExchangeInteractServiceDefinitionDto } from './exchange-interact-service-definition.dto';
import { CallbackConfigurationDto } from './callback-configuration.dto';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * In order to keep the VC-API implementation generic (not specific to any use-cases), exchanges are configured rather than coded into the application.
 * This configuration is done at runtime via the use of Exchange Definitions.
 */
export class ExchangeDefinitionDto {
  @IsString()
  @ApiProperty({
    description: 'The id of the exchange. It must be unique in the context of each VC API instance.'
  })
  exchangeId: string;

  @ValidateNested()
  @IsArray()
  @Type(() => ExchangeInteractServiceDefinitionDto)
  @ApiProperty({
    description:
      'The Interact Service Definitions are related to the Interaction Types of the Verifiable Presentation Request (VPR) specification.\n' +
      'However, as it is a configuration object, it not identical to a VPR interact services.\n' +
      'It can be see as the input data that the application uses to generate VPR interact services during the exchanges.',
    type: ExchangeInteractServiceDefinitionDto,
    isArray: true
  })
  interactServices: ExchangeInteractServiceDefinitionDto[];

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => VpRequestQueryDto)
  @ApiProperty({
    description: 'Defines requests for data in the Verifiable Presentation',
    type: VpRequestQueryDto,
    isArray: true
  })
  query: VpRequestQueryDto[];

  @IsBoolean()
  @ApiProperty({
    description:
      'Indicates whether or not the exchange should only be used once.\n\n' +
      'If wanting to ensure that the exchange will only be used once, this should be true.\n' +
      'This could be useful to, for example, associate the exchange is a specific instance of a business process.\n\n' +
      'If wanting to generated an exchange endpoint that can be reused, this should be false.\n' +
      'This could be useful to, for example, generate an exchange url that be put on a QR code sticker and distributed'
  })
  isOneTime: boolean;

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => CallbackConfigurationDto)
  @ApiProperty({
    description:
      'An array of "callbacks" that will be used by VC API to send notifications on the status/result of the exchange.',
    type: CallbackConfigurationDto,
    isArray: true
  })
  callback: CallbackConfigurationDto[];
}
