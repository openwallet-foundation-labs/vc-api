/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
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
