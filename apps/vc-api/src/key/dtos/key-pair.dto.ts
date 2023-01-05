/**
 * Copyright 2021 - 2023 Energy Web Foundation
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

import { IsNotEmptyObject } from 'class-validator';
import { JWK } from 'jose';
import { ApiProperty } from '@nestjs/swagger';

/**
 * KeyPair
 */
export class KeyPairDto {
  @IsNotEmptyObject()
  @ApiProperty({ description: 'private key JWK' })
  // TODO: decide if to reuse JsonWebKeyDto or define a new Dto class with more fields like in JWK interface from jose
  public privateKey: JWK;

  @IsNotEmptyObject()
  @ApiProperty({ description: 'public key JWK' })
  public publicKey: JWK;
}
