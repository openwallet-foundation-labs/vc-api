/**
 * Copyright 2021, 2022 Energy Web Foundation
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { VpRequestQueryType } from '../types/vp-request-query-type';
import { VpRequestDidAuthQueryDto } from './vp-request-did-auth-query.dto';
import { VpRequestPresentationDefinitionQueryDto } from './vp-request-presentation-defintion-query.dto';
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';

/**
 * https://w3c-ccg.github.io/vp-request-spec/#query-and-response-types
 */
@ApiExtraModels(VpRequestPresentationDefinitionQueryDto, VpRequestDidAuthQueryDto)
export class VpRequestQueryDto {
  @IsEnum(VpRequestQueryType)
  @ApiProperty({
    description:
      'Query types as listed in the VP Request spec.\n' +
      'https://w3c-ccg.github.io/vp-request-spec/#query-and-response-types\n\n' +
      'The "PresentationDefinition" type is proposed here: https://github.com/w3c-ccg/vp-request-spec/issues/7',
    enum: VpRequestQueryType,
    enumName: 'VpRequestQueryType'
  })
  type: VpRequestQueryType;

  /**
   * The credential query.
   * It should correspond to the query type.
   */
  @ValidateNested({ each: true })
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(1)
  @Type(() => VpRequestPresentationDefinitionQueryDto, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: VpRequestPresentationDefinitionQueryDto, name: VpRequestQueryType.presentationDefinition },
        { value: VpRequestDidAuthQueryDto, name: VpRequestQueryType.didAuth }
      ]
    }
  })
  @ApiProperty({
    description: 'The credential query.\nIt should correspond to the query type.',
    type: 'array',
    items: {
      oneOf: [
        { $ref: getSchemaPath(VpRequestPresentationDefinitionQueryDto) },
        { $ref: getSchemaPath(VpRequestDidAuthQueryDto) }
      ]
    },
    example: [
      {
        presentationDefinition: {
          id: '00000000-0000-4000-0000-000000000000',
          input_descriptors: []
        }
      }
    ]
  })
  credentialQuery: Array<VpRequestPresentationDefinitionQueryDto | VpRequestDidAuthQueryDto>;
}
