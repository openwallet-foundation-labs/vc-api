/*
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

import { ArrayMaxSize, ArrayMinSize, IsArray, IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsAllowedFieldJsonPathKey, IsTopLevelFieldJsonPath, IsValidJsonSchema } from '../../../validators';

export const exampleFieldFilter = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'array',
  items: [
    {
      const: 'https://www.w3.org/2018/credentials/v1'
    },
    {
      $ref: '#/definitions/eliaGroupContext'
    }
  ],
  additionalItems: false,
  minItems: 2,
  maxItems: 2,
  definitions: {
    eliaGroupContext: {
      type: 'object',
      properties: {
        elia: {
          const: 'https://www.eliagroup.eu/ld-context-2022#'
        },
        consent: {
          const: 'elia:consent'
        }
      },
      additionalProperties: false,
      required: ['elia', 'consent']
    }
  }
};

export class FieldDto {
  @IsAllowedFieldJsonPathKey({ each: true })
  @IsTopLevelFieldJsonPath({ each: true })
  @ArrayMaxSize(1)
  @ArrayMinSize(1)
  @IsArray()
  @IsNotEmpty()
  @ApiProperty({ example: ['$.@context'] })
  path: string[];

  @IsValidJsonSchema()
  @IsObject()
  @IsNotEmpty()
  @ApiProperty({ example: JSON.stringify(exampleFieldFilter) })
  filter: unknown;
}
