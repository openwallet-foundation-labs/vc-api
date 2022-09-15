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

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JsonWebKeyDto } from './json-web-key.dto';
import { Type } from 'class-transformer';

export class VerificationMethodDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  controller: string;

  @ApiPropertyOptional({ type: JsonWebKeyDto })
  @Type(() => JsonWebKeyDto)
  publicKeyJwk?: JsonWebKeyDto;

  constructor(partial: Partial<VerificationMethodDto>) {
    Object.assign(this, partial);
  }
}
