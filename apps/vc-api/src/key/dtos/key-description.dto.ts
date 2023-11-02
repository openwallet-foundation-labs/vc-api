/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { IKeyDescription } from '@energyweb/w3c-ccg-webkms';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * KeyPair
 */
export class KeyDescriptionDto implements IKeyDescription {
  @IsString()
  @ApiProperty({ description: 'id of key (for example, JWK thumbprint)' })
  public keyId: string;
}
