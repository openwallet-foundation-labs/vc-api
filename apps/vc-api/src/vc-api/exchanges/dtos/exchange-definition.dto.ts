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

import { IsArray, IsBoolean, IsNumber, IsString, ValidateNested } from 'class-validator';
import { VpRequestQueryDto } from './vp-request-query.dto';
import { ExchangeInteractServiceDefinitionDto } from './exchange-interact-service-definition.dto';
import { CallbackConfigurationDto } from './callback-configuration.dto';
import { Type } from 'class-transformer';

/**
 * A exchange definition
 */
export class ExchangeDefinitionDto {
  @IsString()
  exchangeId: string;

  @ValidateNested()
  @IsArray()
  @Type(() => ExchangeInteractServiceDefinitionDto)
  interactServices: ExchangeInteractServiceDefinitionDto[];

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => VpRequestQueryDto)
  query: VpRequestQueryDto[];

  @IsBoolean()
  isOneTime: boolean;

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => CallbackConfigurationDto)
  callback: CallbackConfigurationDto[];
}
