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
