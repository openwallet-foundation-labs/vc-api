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
