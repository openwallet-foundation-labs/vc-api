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

import { Column, Entity } from 'typeorm';
import { PresentationReviewStatus } from '../types/presentation-review-status';
import { VerifiablePresentation } from '../types/verifiable-presentation';

/**
 * A TypeOrm entity representing a Presentation Review
 *
 * For a mediated presentation flow, there could be a review of the presentation
 */
@Entity()
export class PresentationReviewEntity {
  /**
   * Id for this presentation review
   */
  @Column('text', { primary: true })
  presentationReviewId: string;

  @Column('text')
  reviewStatus: PresentationReviewStatus;

  /**
   * If issuing credentials as a part of this exchange, they could be returned in a VP
   */
  @Column('simple-json', { nullable: true })
  VP?: VerifiablePresentation;
}
