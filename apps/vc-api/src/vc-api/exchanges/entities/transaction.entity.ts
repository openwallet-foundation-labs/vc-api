/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ExchangeResponseDto } from '../dtos/exchange-response.dto';
import { PresentationReviewStatus } from '../types/presentation-review-status';
import { VerifiablePresentation } from '../types/verifiable-presentation';
import { VpRequestInteractServiceType } from '../types/vp-request-interact-service-type';
import { PresentationReviewEntity } from './presentation-review.entity';
import { VpRequestEntity } from './vp-request.entity';
import { CallbackConfiguration } from '../types/callback-configuration';
import { PresentationSubmissionEntity } from './presentation-submission.entity';
import { SubmissionVerifier } from '../types/submission-verifier';
import { exhaustiveMatchGuard } from '../../exhaustiveMatchGuard';

export class TransactionEntityException extends Error {
  constructor(message?: string) {
    super(message);
    this.initName();
  }

  public initName(): void {
    this.name = this.constructor.name;
  }
}

export class TransactionDidForbiddenException extends TransactionEntityException {}

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
        reviewStatus: PresentationReviewStatus.pendingSubmission
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
    cascade: true,
    nullable: true
  })
  @JoinColumn()
  presentationReview?: PresentationReviewEntity;

  /**
   * Each transaction is a part of an exchange
   * https://w3c-ccg.github.io/vc-api/#exchange-examples
   */
  @Column('text')
  exchangeId: string;

  /**
   */
  @OneToOne(() => PresentationSubmissionEntity, {
    cascade: true,
    nullable: true
  })
  @JoinColumn()
  presentationSubmission?: PresentationSubmissionEntity;

  @Column('simple-json')
  callback: CallbackConfiguration[];

  public approvePresentationSubmission(issuanceVp: VerifiablePresentation): void {
    this.presentationReview.reviewStatus = PresentationReviewStatus.approved;
    this.presentationReview.VP = issuanceVp;
  }

  public rejectPresentationSubmission(): void {
    this.presentationReview.reviewStatus = PresentationReviewStatus.rejected;
  }

  /**
   * Process a presentation submission.
   * @param presentation
   * @param verifier
   */
  public async processPresentation(
    presentation: VerifiablePresentation,
    verifier: SubmissionVerifier
  ): Promise<{ response: ExchangeResponseDto & { errors: string[] }; callback: CallbackConfiguration[] }> {
    if (this.presentationSubmission && this.presentationSubmission.vpHolder !== presentation.holder) {
      throw new TransactionDidForbiddenException(
        'DID does not match the DID that initially submitted the presentation'
      );
    }

    const verificationResult = await verifier.verifyVpRequestSubmission(presentation, this.vpRequest);
    const errors = verificationResult.errors;

    if (errors.length > 0) {
      return {
        response: {
          errors,
          processingInProgress: false
        },
        callback: []
      };
    }

    const service = this.vpRequest.interact.service[0]; // TODO: Not sure how to handle multiple interaction services

    if (service.type === VpRequestInteractServiceType.mediatedPresentation) {
      switch (this.presentationReview.reviewStatus) {
        case PresentationReviewStatus.pendingSubmission:
          // TODO: should we allow overwrite of a previous submitted submission?
          if (!this.presentationSubmission) {
            this.presentationSubmission = new PresentationSubmissionEntity(presentation, verificationResult);
          }
          this.presentationReview.reviewStatus = PresentationReviewStatus.pendingReview;
          return {
            response: {
              errors: [],
              vpRequest: this.vpRequest,
              processingInProgress: true
            },
            callback: this.callback
          };
        case PresentationReviewStatus.pendingReview:
          return {
            response: {
              errors: [],
              vpRequest: this.vpRequest,
              processingInProgress: true
            },
            callback: this.callback
          };
        case PresentationReviewStatus.approved:
        case PresentationReviewStatus.rejected:
          return {
            response: {
              errors: [],
              vp: this.presentationReview?.VP,
              processingInProgress: false
            },
            callback: []
          };
        default:
          return exhaustiveMatchGuard(this.presentationReview.reviewStatus);
      }
    }
    if (service.type === VpRequestInteractServiceType.unmediatedPresentation) {
      this.presentationSubmission = new PresentationSubmissionEntity(presentation, verificationResult);
      return {
        response: {
          errors: [],
          processingInProgress: false
        },
        callback: this.callback
      };
    }
  }
}
