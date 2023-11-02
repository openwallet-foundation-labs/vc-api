/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiProperty } from '@nestjs/swagger';

export class ConflictErrorResponseDto {
  @ApiProperty({ example: 409 })
  statusCode: 409;

  @ApiProperty()
  message: string;

  @ApiProperty({ example: 'Conflict' })
  error: 'Conflict';
}
