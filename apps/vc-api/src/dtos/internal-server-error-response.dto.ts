/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InternalServerErrorResponseDto {
  @ApiProperty({ example: 500 })
  statusCode: 500;

  @ApiPropertyOptional({
    oneOf: [
      { type: 'string', example: 'error' },
      {
        type: 'array',
        items: { type: 'string' },
        example: ['error 1', 'error 2']
      }
    ]
  })
  message?: string | string[];

  @ApiProperty({ example: 'Internal Server Error' })
  error: 'Internal Server Error';
}
