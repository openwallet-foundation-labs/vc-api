/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsPresentationDefinitionCredentialQuery } from './custom-validators';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyObject, ValidateNested } from 'class-validator';
import { PresentationDefinitionDto } from './presentation-definition.dto';
import { Type } from 'class-transformer';

/**
 * https://github.com/w3c-ccg/vp-request-spec/issues/7#issuecomment-1067036904
 */
export class VpRequestPresentationDefinitionQueryDto {
  @ValidateNested()
  @IsPresentationDefinitionCredentialQuery()
  @IsNotEmptyObject()
  @Type(() => PresentationDefinitionDto)
  @ApiProperty({
    description:
      'An object conforming to the Presentation Definition specification\n' +
      'https://github.com/w3c-ccg/vp-request-spec/issues/7#issuecomment-1067036904',
    type: PresentationDefinitionDto
  })
  presentationDefinition: PresentationDefinitionDto;
}
