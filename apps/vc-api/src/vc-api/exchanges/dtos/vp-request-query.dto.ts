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

/**
 * https://w3c-ccg.github.io/vp-request-spec/#query-types
 */
export class VpRequestQueryDto {
  @IsEnum(VpRequestQueryType)
  type: VpRequestQueryType;

  /**
   * https://github.com/typestack/class-validator/issues/566#issuecomment-605515267
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
  credentialQuery: Array<VpRequestPresentationDefinitionQueryDto | VpRequestDidAuthQueryDto>;
}
