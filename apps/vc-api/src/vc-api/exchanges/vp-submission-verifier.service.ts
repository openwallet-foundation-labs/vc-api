/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { ProofPurpose, IPresentationDefinition, PEX, IPresentation } from '@sphereon/pex';
import { CredentialsService } from '../credentials/credentials.service';
import { VerificationResult } from '../credentials/types/verification-result';
import { VpRequestEntity } from './entities/vp-request.entity';
import { SubmissionVerifier } from './types/submission-verifier';
import { VerifiablePresentation } from './types/verifiable-presentation';
import { VpRequestQueryType } from './types/vp-request-query-type';

/**
 * Inspired by https://github.com/gataca-io/vui-core/blob/6c599bdf7086f9a702e6657089fa343ae62a417a/service/validatorServiceDIFPE.go
 * Verifies:
 *  - Signatures/Proofs
 *  - Conformance with VpRequest (e.g. credential queries)
 *  - Authority of Issuer: TODO use this package https://www.npmjs.com/package/@energyweb/vc-verification
 */
@Injectable()
export class VpSubmissionVerifierService implements SubmissionVerifier {
  constructor(private credentialsService: CredentialsService) {}

  public async verifyVpRequestSubmission(
    vp: VerifiablePresentation,
    vpRequest: VpRequestEntity
  ): Promise<VerificationResult> {
    const proofVerifiactionResult = await this.verifyPresentationProof(vp, vpRequest.challenge);
    const vpRequestValidationErrors = this.validatePresentationAgainstVpRequest(vp, vpRequest);
    return {
      errors: [...proofVerifiactionResult.errors, ...vpRequestValidationErrors],
      checks: [...proofVerifiactionResult.checks],
      warnings: []
    };
  }

  private async verifyPresentationProof(
    vp: VerifiablePresentation,
    challenge: string
  ): Promise<VerificationResult> {
    const verifyOptions = {
      challenge,
      proofPurpose: ProofPurpose.authentication,
      verificationMethod: vp.proof.verificationMethod as string //TODO: fix types here
    };
    const result = await this.credentialsService.verifyPresentation(vp, verifyOptions);
    if (!result.checks.includes('proof') || result.errors.length > 0) {
      return {
        errors: [`verification of presentation proof not successful`, ...result.errors],
        checks: [],
        warnings: []
      };
    }
    return result;
  }

  private validatePresentationAgainstVpRequest(
    presentation: VerifiablePresentation,
    vpRequest: VpRequestEntity
  ): string[] {
    const commonErrors = [];
    // Common checking
    if (presentation.proof.challenge !== vpRequest.challenge) {
      commonErrors.push('Challenge does not match');
    }

    // Type specific checking
    const partialErrors = vpRequest.query.flatMap((vpQuery) => {
      switch (vpQuery.type) {
        case VpRequestQueryType.didAuth:
          return this.verifyVpRequestTypeDidAuth(presentation);
        case VpRequestQueryType.presentationDefinition:
          return this.verifyVpRequestTypePresentationDefinition(presentation, vpQuery.credentialQuery);
        default:
          return ['Unknown request query type'];
      }
    });

    return [...partialErrors, ...commonErrors];
  }

  private verifyVpRequestTypeDidAuth(presentation: VerifiablePresentation): string[] {
    // https://w3c-ccg.github.io/vp-request-spec/#did-authentication-request
    const errors: string[] = [];

    if (!presentation.holder) {
      errors.push('Presentation holder is required for didAuth query');
    }

    return errors;
  }

  private verifyVpRequestTypePresentationDefinition(
    presentation: VerifiablePresentation,
    credentialQuery: Array<{ presentationDefinition: IPresentationDefinition }>
  ): string[] {
    // https://identity.foundation/presentation-exchange/#presentation-definition
    const errors: string[] = [];
    const pex: PEX = new PEX();

    credentialQuery.forEach(({ presentationDefinition }, index) => {
      let partialErrors;

      try {
        const { errors } = pex.evaluatePresentation(presentationDefinition, presentation as IPresentation);
        partialErrors = errors;
      } catch (err) {
        if (typeof err === 'string') {
          partialErrors = [{ message: err }];
        } else {
          throw err;
        }
      }

      errors.push(
        ...partialErrors.map(
          (error) =>
            `Presentation definition (${index + 1}) validation failed, reason: ${error.message || 'Unknown'}`
        )
      );
    });

    return errors;
  }
}
