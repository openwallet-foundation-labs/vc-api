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
  constructor(vp: VerifiablePresentation) {
    this.vp = vp;
    this.verificationResult = {
      checks: [], // TODO: add correct checks (e.g. proof check from service)
      warnings: [],
      errors: []
    };
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
