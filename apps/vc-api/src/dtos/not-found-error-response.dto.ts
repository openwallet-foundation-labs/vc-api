/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiProperty } from '@nestjs/swagger';

export class NotFoundErrorResponseDto {
  @ApiProperty({ example: 404 })
  statusCode: 404;

  @ApiProperty()
  message: string;

  @ApiProperty({ example: 'Not Found' })
  error: 'Not Found';
}
