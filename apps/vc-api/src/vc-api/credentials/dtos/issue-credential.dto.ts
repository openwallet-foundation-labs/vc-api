/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsNotEmpty, IsNotEmptyObject, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { CredentialDto } from './credential.dto';
import { IssueOptionsDto } from './issue-options.dto';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO which contains credential and options
 */
export class IssueCredentialDto {
  @ValidateNested()
  @Type(() => CredentialDto)
  @IsNotEmpty()
  @IsNotEmptyObject()
  @ApiProperty({ type: CredentialDto })
  credential: CredentialDto;

  @Type(() => IssueOptionsDto)
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ type: IssueOptionsDto })
  options?: IssueOptionsDto;
}
