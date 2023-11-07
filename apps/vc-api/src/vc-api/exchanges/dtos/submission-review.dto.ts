/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from 'class-transformer';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { VerifiablePresentationDto } from '../../credentials/dtos/verifiable-presentation.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReviewResult {
  approved = 'approved',
  rejected = 'rejected'
}

export class SubmissionReviewDto {
  @IsEnum(ReviewResult)
  @ApiProperty({
    description: 'The judgement made by the reviewer',
    enum: ReviewResult,
    enumName: 'ReviewResult'
  })
  result: ReviewResult;

  @ValidateNested()
  @IsOptional()
  @Type(() => VerifiablePresentationDto)
  @ApiPropertyOptional({
    description: 'A reviewer may want to include credentials (wrapped in a VP) to the holder'
  })
  vp?: VerifiablePresentationDto;
}
