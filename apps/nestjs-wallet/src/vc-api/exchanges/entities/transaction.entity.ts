import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ExchangeResponseDto } from '../dtos/exchange-response.dto';
import { PresentationReviewStatus } from '../types/presentation-review-status';
import { VerifiablePresentation } from '../types/verifiable-presentation';
import { VpRequestInteractServiceType } from '../types/vp-request-interact-service-type';
import { VpRequestQueryType } from '../types/vp-request-query-type';
import { PresentationReviewEntity } from './presentation-review.entity';
import { VpRequestEntity } from './vp-request.entity';
import { CallbackConfiguration } from '../types/callback-configuration';

/**
 * A TypeOrm entity representing an exchange transaction
 * https://w3c-ccg.github.io/vc-api/#exchange-examples
 *
 * Some discussion regarding the rational behind the names:
 * https://github.com/w3c-ccg/vc-api/pull/262#discussion_r805895143
 */
@Entity()
export class TransactionEntity {
  constructor(
    transactionId: string,
    exchangeId: string,
    vpRequest: VpRequestEntity,
    callback: CallbackConfiguration[]
  ) {
    this.transactionId = transactionId;
    this.exchangeId = exchangeId;
    this.vpRequest = vpRequest;
    if (vpRequest?.interact?.service[0]?.type === VpRequestInteractServiceType.mediatedPresentation) {
      this.presentationReview = {
        presentationReviewId: uuidv4(),
        reviewStatus: PresentationReviewStatus.pending
      };
    }
    this.callback = callback;
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

  @Column('simple-json')
  callback: CallbackConfiguration[];

  /**
   * Process a presentation submission.
   * Check the correctness of the presentation against the VP Request Credential Queries.
   * Does NOT check signatures.
   * @param presentation
   */
  public processPresentation(presentation: VerifiablePresentation): {
    response: ExchangeResponseDto;
    callback: CallbackConfiguration[];
  } {
    // TODO check that submitted presentation matches the vpRequest
    // Checks could be similar to https://github.com/gataca-io/vui-core/blob/46352ccff298eb1d237e4072d982768d79001041/service/validatorServiceDIFPE.go#L54

    const service = this.vpRequest.interact.service[0]; // TODO: Not sure how to handle multiple interaction services
    if (service.type == VpRequestInteractServiceType.mediatedPresentation) {
      if (this.presentationReview.reviewStatus == PresentationReviewStatus.pending) {
        // In this case, this is the first submission to the exchange
        if (!this.submittedVP) {
          this.submittedVP = presentation;
        }
        return {
          response: {
            errors: [],
            vpRequest: {
              challenge: uuidv4(),
              query: [{ type: VpRequestQueryType.didAuth, credentialQuery: [] }],
              interact: this.vpRequest.interact // Just ask the same endpoint again
            }
          },
          callback: []
        };
      }
      if (this.presentationReview.reviewStatus == PresentationReviewStatus.approved) {
        if (this.presentationReview.VP) {
          return {
            response: {
              errors: [],
              vp: this.presentationReview.VP
            },
            callback: []
          };
        } else {
          return {
            response: {
              errors: []
            },
            callback: []
          };
        }
      }
    }
    if (service.type == VpRequestInteractServiceType.unmediatedPresentation) {
      return {
        response: {
          errors: []
        },
        callback: this.callback
      };
    }
  }
}
