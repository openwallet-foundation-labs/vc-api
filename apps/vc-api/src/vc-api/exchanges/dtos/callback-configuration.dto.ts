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

import { IsUrl } from 'class-validator';
import { CallbackConfiguration } from '../types/callback-configuration';
import { ApiProperty } from '@nestjs/swagger';

/**
 * An exchange result callback
 */
export class CallbackConfigurationDto implements CallbackConfiguration {
  @IsUrl({
    require_tld: false, //to allow localhost, see https://github.com/validatorjs/validator.js/issues/754
    require_protocol: true
  })
  @ApiProperty({
    description:
      'URL at a callback notification will be sent:\n' +
      '- when a VP is submitted to a "mediated" exchange\n' +
      '- after the exchange has completed',
    example: 'https://example.com'
  })
  url: string;
}
