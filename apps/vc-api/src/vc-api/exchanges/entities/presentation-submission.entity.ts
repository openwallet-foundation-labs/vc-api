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

import { VerificationResult } from '../../credentials/types/verification-result';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { VerifiablePresentation } from '../types/verifiable-presentation';

/**
 * A TypeOrm entity representing a Presentation Submission.
 * This is a presentation submitted in response to a VP Request https://w3c-ccg.github.io/vp-request-spec/.
 * Related to a presentation exchange submission (https://identity.foundation/presentation-exchange/#presentation-submission),
 * in that the submitted VP could contain a presentation_submission.
 */
@Entity()
export class PresentationSubmissionEntity {
  constructor(vp: VerifiablePresentation, verificationResult: VerificationResult) {
    this.vp = vp;
    this.verificationResult = verificationResult;
  }

  @PrimaryGeneratedColumn()
  id: string;

  /**
   * The result of the verification of the submitted VP
   */
  @Column('simple-json')
  verificationResult: VerificationResult;

  /**
   * The Verifiable Presentation submitted in response to the transaction's VP Request
   */
  @Column('simple-json')
  vp: VerifiablePresentation;
}
