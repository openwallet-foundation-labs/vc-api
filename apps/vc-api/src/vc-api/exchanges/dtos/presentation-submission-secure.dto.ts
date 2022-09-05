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

import { VerificationResultDto } from '../../credentials/dtos/verification-result.dto';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Secure Presentation Submission Dto
 * A representation of a presentation submission which does not have personal data associated with the submission
 */
export class PresentationSubmissionSecureDto {
  /**
   * The result of the verification of the submitted VP
   */
  @ValidateNested()
  @Type(() => VerificationResultDto)
  verificationResult: VerificationResultDto;
}
