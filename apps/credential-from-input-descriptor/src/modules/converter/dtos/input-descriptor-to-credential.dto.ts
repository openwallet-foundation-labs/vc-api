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

import { IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ConstraintsDto } from './constraints.dto';
import { ApiProperty } from '@nestjs/swagger';
import { exampleFieldFilter } from './field.dto';

const examplePayload = {
  fields: [
    { path: '$.@context', filter: exampleFieldFilter },
    { path: '$.type', filter: exampleFieldFilter },
    { path: '$.credentialSubject', filter: exampleFieldFilter }
  ]
};

export class InputDesciptorToCredentialDto {
  @ValidateNested()
  @Type(() => ConstraintsDto)
  @IsNotEmpty()
  @ApiProperty({ example: JSON.stringify(examplePayload) })
  constraints: ConstraintsDto;
}
