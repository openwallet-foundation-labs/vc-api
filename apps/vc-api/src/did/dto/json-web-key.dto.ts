/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class JsonWebKeyDto {
  @ApiPropertyOptional()
  alg?: string;

  @ApiPropertyOptional()
  crv?: string;

  @ApiPropertyOptional()
  e?: string;

  @ApiPropertyOptional()
  ext?: boolean;

  @ApiPropertyOptional()
  key_ops?: string[];

  @ApiPropertyOptional()
  kid?: string;

  @ApiProperty()
  kty: string;

  @ApiPropertyOptional()
  n?: string;

  @ApiPropertyOptional()
  use?: string;

  @ApiPropertyOptional()
  x?: string;

  @ApiPropertyOptional()
  y?: string;

  constructor(partial: Partial<JsonWebKeyDto>) {
    Object.assign(this, partial);
  }
}
