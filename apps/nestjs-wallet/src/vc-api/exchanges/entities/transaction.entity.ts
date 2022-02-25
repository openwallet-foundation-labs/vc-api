import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ExchangeResponseDto } from '../dtos/exchange-response.dto';
import { PresentationReviewStatus } from '../types/presentation-review-status';
import { VerifiablePresentation } from '../types/verifiable-presentation';
import { VpRequestInteractServiceType } from '../types/vp-request-interact-service-type';
import { VpRequestQueryType } from '../types/vp-request-query-type';
import { PresentationReviewEntity } from './presentation-review.entity';
import { VpRequestEntity } from './vp-request.entity';

/**
 * A TypeOrm entity representing an exchange transaction
 * https://w3c-ccg.github.io/vc-api/#exchange-examples
 *
 * Some discussion regarding the rational behind the names:
 * https://github.com/w3c-ccg/vc-api/pull/262#discussion_r805895143
 */
@Entity()
export class TransactionEntity {
  constructor(transactionId: string, exchangeId: string, vpRequest: VpRequestEntity) {
    this.transactionId = transactionId;
    this.exchangeId = exchangeId;
    this.vpRequest = vpRequest;
    if (vpRequest?.interact?.service[0].type === VpRequestInteractServiceType.mediatedPresentation) {
      this.presentationReview = {
        presentationReviewId: uuidv4(),
        reviewStatus: PresentationReviewStatus.pending
      };
    }
  }

  /**
   * An id for the transaction
   */
  @Column('text', { primary: true })
  transactionId: string;

  /**
   * VP Requests are defined here: https://w3c-ccg.github.io/vp-request-spec/
   */
  @OneToOne(() => VpRequestEntity, {
    cascade: true
  })
  @JoinColumn()
  vpRequest: VpRequestEntity;

  /**
   */
  @OneToOne(() => PresentationReviewEntity, {
    cascade: true
  })
  @JoinColumn()
  presentationReview: PresentationReviewEntity;

  /**
   * Assumes that each transaction is a part of an exchange execution
   * https://w3c-ccg.github.io/vc-api/#exchange-examples
   */
  @Column('text')
  exchangeId: string;

  /**
   * The Verifiable Presentation submitted in response to the VP Request
   */
  @Column('simple-json', { nullable: true })
  submittedVP?: VerifiablePresentation;

  /**
   * Process a presentation submission.
   * Check the correctness of the presentation against the VP Request Credential Queries.
   * Does NOT check signatures.
   * @param presentation
   */
  public processPresentation(presentation: VerifiablePresentation): ExchangeResponseDto {
    // TODO check that submitted presentation matches the vpRequest
    const service = this.vpRequest.interact.service[0]; // Not sure how to handle multiple interaction services
    if (
      service.type == VpRequestInteractServiceType.mediatedPresentation &&
      this.presentationReview.reviewStatus == PresentationReviewStatus.pending &&
      !this.submittedVP
    ) {
      this.submittedVP = presentation;
    }
    if (
      service.type == VpRequestInteractServiceType.mediatedPresentation &&
      this.presentationReview.reviewStatus == PresentationReviewStatus.pending &&
      this.submittedVP
    ) {
      return {
        errors: [],
        vpRequest: {
          challenge: uuidv4(),
          query: [{ type: VpRequestQueryType.didAuth }],
          interact: this.vpRequest.interact // Just ask the same endpoint again
        }
      };
    }
    if (
      service.type == VpRequestInteractServiceType.mediatedPresentation &&
      this.presentationReview.reviewStatus == PresentationReviewStatus.approved
    ) {
      if (this.presentationReview.VP) {
        return {
          errors: [],
          vp: this.presentationReview.VP
        };
      } else {
        return {
          errors: []
        };
      }
    }
  }
}
