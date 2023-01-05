/**
 * Copyright 2021 - 2023 Energy Web Foundation
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

import { IsArray, IsString } from 'class-validator';
import { VerificationResult } from '../types/verification-result';
import { ApiProperty } from '@nestjs/swagger';

/**
 * A response object from verification of a credential or a presentation.
 * https://w3c-ccg.github.io/vc-api/verifier.html
 */
export class VerificationResultDto implements VerificationResult {
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'The checks performed' })
  checks: string[];

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'Warnings' })
  warnings: string[];

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'Errors' })
  errors: string[];
}
