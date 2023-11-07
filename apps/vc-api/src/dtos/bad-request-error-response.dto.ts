/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiProperty } from '@nestjs/swagger';

export class BadRequestErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: 400;

  @ApiProperty({
    oneOf: [
      {
        type: 'array',
        items: { type: 'string' },
        example: ['error 1', 'error 2']
      },
      { type: 'string', example: 'error' }
    ]
  })
  message: string | string[];

  @ApiProperty({ example: 'Bad Request' })
  error: 'Bad Request';
}
