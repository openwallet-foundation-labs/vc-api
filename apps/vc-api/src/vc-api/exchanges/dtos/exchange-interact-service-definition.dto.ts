/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsEnum } from 'class-validator';
import { VpRequestInteractServiceType } from '../types/vp-request-interact-service-type';
import { ApiProperty } from '@nestjs/swagger';

/**
 * A definition of an interact service to be used in a workflow
 */
export class ExchangeInteractServiceDefinitionDto {
  @IsEnum(VpRequestInteractServiceType)
  @ApiProperty({
    description:
      'The "type" of the interact service.\n' +
      'See Verifiable Presentation Request [Interaction Types](https://w3c-ccg.github.io/vp-request-spec/#interaction-types) for background.',
    enum: VpRequestInteractServiceType,
    enumName: 'VpRequestInteractServiceType'
  })
  type: VpRequestInteractServiceType;
}
