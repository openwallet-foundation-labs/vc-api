/**
 * Copyright 2021, 2022 Energy Web Foundation
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

import { IsObject, IsOptional, ValidateNested } from 'class-validator';
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
  @ApiProperty({ type: CredentialDto })
  credential: CredentialDto;

  @Type(() => IssueOptionsDto)
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ type: IssueOptionsDto })
  options?: IssueOptionsDto;
}
