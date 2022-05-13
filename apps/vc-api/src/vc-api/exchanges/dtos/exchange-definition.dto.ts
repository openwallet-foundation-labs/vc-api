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

import { IsArray, IsBoolean, IsString, ValidateNested } from 'class-validator';
import { VpRequestQueryDto } from './vp-request-query.dto';
import { ExchangeInteractServiceDefinitionDto } from './exchange-interact-service-definition.dto';
import { CallbackConfigurationDto } from './callback-configuration.dto';
import { Type } from 'class-transformer';

/**
 * In order to keep the VC-API implementation generic (not specific to any use-cases), exchanges are configured rather than coded into the application.
 * This configuration is done at runtime via the use of Exchange Definitions.
 */
export class ExchangeDefinitionDto {
  /**
   * The id of the exchange. It must be unique in the context of each VC API instance.
   */
  @IsString()
  exchangeId: string;

  /**
   * The Interact Service Definitions are related to the Interaction Types of the Verifiable Presentation Request (VPR) specification.
   * However, as it is a configuration object, it not identical to a VPR interact services.
   * It can be see as the input data that the application uses to generate VPR interact services during the exchanges.
   */
  @ValidateNested()
  @IsArray()
  @Type(() => ExchangeInteractServiceDefinitionDto)
  interactServices: ExchangeInteractServiceDefinitionDto[];

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => VpRequestQueryDto)
  query: VpRequestQueryDto[];

  /**
   * Indicates whether or not the exchange should only be used once.
   *
   * If wanting to ensure that the exchange will only be used once, this should be true.
   * This could be useful to, for example, associate the exchange is a specific instance of a business process.
   *
   * If wanting to generated an exchange endpoint that can be reused, this should be false.
   * This could be useful to, for example, generate an exchange url that be put on a QR code sticker and distributed
   */
  @IsBoolean()
  isOneTime: boolean;

  /**
   * An array of "callbacks" that will be used by VC API to send notifications on the status/result of the exchange.
   */
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => CallbackConfigurationDto)
  callback: CallbackConfigurationDto[];
}
