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

import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DidMethod } from '../types/did-method';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDidOptionsDto {
  @IsEnum(DidMethod)
  @ApiProperty({
    description: 'DID Method to create.\nMust be one of "key" or "ethr"',
    enum: DidMethod,
    enumName: 'DidMethod'
  })
  method: DidMethod;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'id of key (for example, JWK thumbprint).\n' +
      'This key must be known to the server already.\n' +
      'If provided, DID will be created using this key.\n' +
      'Currently only supported for did:key.'
  })
  keyId?: string;
}
