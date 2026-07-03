/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DIDService } from '../../did/did.service';
import { IssueCredentialDto } from './dtos/issue-credential.dto';
import { VerifiableCredentialDto } from './dtos/verifiable-credential.dto';
import { VerifiablePresentationDto } from './dtos/verifiable-presentation.dto';
import { VerifyOptionsDto } from './dtos/verify-options.dto';
import { VerificationResultDto } from './dtos/verification-result.dto';
import { ProvePresentationDto } from './dtos/prove-presentation.dto';
import { CredentialVerifier } from './types/credential-verifier';
import { PresentationDto } from './dtos/presentation.dto';
import { IPresentationDefinition, IVerifiableCredential, PEX, ProofPurpose, Status } from '@sphereon/pex';
import { VerificationMethod } from 'did-resolver';
import { CredoService } from '../../credo/credo.service';
import {
  ClaimFormat,
  JsonTransformer,
  W3cCredential,
  W3cJsonLdSignCredentialOptions,
  W3cJsonLdVerifiableCredential,
  W3cJsonLdVerifiablePresentation,
  W3cPresentation,
  W3cSignPresentationOptions,
  W3cVerifyCredentialOptions,
  W3cVerifyCredentialResult,
  W3cVerifyPresentationOptions
} from '@credo-ts/core';
import { AuthenticateDto } from './dtos/authenticate.dto';
import { transformVerificationResult } from './utils/verification-result-transformer';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { purposes } from '@digitalcredentials/jsonld-signatures';

/**
 * This service provide the VC-API operations
 * This encapsulates the use of Spruce DIDKit
 */
@Injectable()
export class CredentialsService implements CredentialVerifier {
  constructor(
    private didService: DIDService,
    private credoService: CredoService
  ) {}

  async issueCredential(issueDto: IssueCredentialDto): Promise<VerifiableCredentialDto> {
    const verificationMethod = await this.getVerificationMethodForDid(
      typeof issueDto.credential.issuer === 'string'
        ? issueDto.credential.issuer
        : issueDto.credential.issuer.id
    );
    const credentialOption: W3cJsonLdSignCredentialOptions = {
      credential: W3cCredential.fromJson(issueDto.credential),
      format: ClaimFormat.LdpVc,
      proofType: 'Ed25519Signature2018',
      verificationMethod: verificationMethod.id
    };
    const w3cVerifiableCredential =
      await this.credoService.agent.w3cCredentials.signCredential<ClaimFormat.LdpVc>(credentialOption);
    return w3cVerifiableCredential.toJson() as VerifiableCredentialDto;
  }

  async verifyCredential(vc: VerifiableCredentialDto): Promise<VerificationResultDto> {
    const w3cVerifyCredentialOptions: W3cVerifyCredentialOptions<ClaimFormat.LdpVc> = {
      credential: W3cJsonLdVerifiableCredential.fromJson(vc)
    };

    // Using "any" until Credo types are fixed https://github.com/openwallet-foundation/credo-ts/issues/2043
    const verifyCredential: W3cVerifyCredentialResult =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await this.credoService.agent.w3cCredentials.verifyCredential(w3cVerifyCredentialOptions as any);
    return transformVerificationResult(verifyCredential);
  }

  /**
   * Assembles presentation from provided credentials according to definition
   */
  presentationFrom(
    presentationDefinition: IPresentationDefinition,
    credentials: VerifiableCredentialDto[]
  ): PresentationDto {
    const pex = new PEX();
    // presentation should be created from selected credentials https://github.com/Sphereon-Opensource/pex/issues/91#issuecomment-1115940908
    const { verifiableCredential, areRequiredCredentialsPresent } = pex.selectFrom(
      presentationDefinition,
      credentials as IVerifiableCredential[]
    );
    if (areRequiredCredentialsPresent !== Status.INFO) {
      throw new InternalServerErrorException('Credentials do not satisfy defintion');
    }
    const presentation = pex.presentationFrom(presentationDefinition, verifiableCredential);

    return presentation as PresentationDto;
  }

  async provePresentation(provePresentationDto: ProvePresentationDto): Promise<VerifiablePresentationDto> {
    const verificationMethodId =
      provePresentationDto.options.verificationMethod ??
      (await this.getVerificationMethodForDid(provePresentationDto.presentation.holder)).id;

    const signPresentationOption: W3cSignPresentationOptions<ClaimFormat.LdpVp> = {
      presentation: this.transformToCredoPresentation(provePresentationDto.presentation, W3cPresentation),
      challenge: provePresentationDto.options.challenge,
      verificationMethod: verificationMethodId,
      format: ClaimFormat.LdpVp,
      proofType: 'Ed25519Signature2018',
      proofPurpose: this.toProofPurposeInstance(
        provePresentationDto.options.proofPurpose,
        provePresentationDto.options.challenge,
        provePresentationDto.options.domain
      )
    };
    const w3cVerifiablePresentation =
      await this.credoService.agent.w3cCredentials.signPresentation<ClaimFormat.LdpVp>(
        signPresentationOption
      );

    return w3cVerifiablePresentation.toJson() as VerifiablePresentationDto;
  }

  /**
   * Provide authentication as DID in response to DIDAuth Request
   * https://w3c-ccg.github.io/vp-request-spec/#did-authentication-request
   */
  async didAuthenticate(authenticateDto: AuthenticateDto): Promise<VerifiablePresentationDto> {
    if (authenticateDto.options.proofPurpose !== ProofPurpose.authentication) {
      throw new BadRequestException('proof purpose must be authentication for DIDAuth');
    }
    const signPresentationDto: ProvePresentationDto = {
      presentation: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiablePresentation'],
        holder: authenticateDto.did
      },
      options: authenticateDto.options
    };

    const signed = await this.provePresentation(signPresentationDto);

    return signed;
  }

  async verifyPresentation(
    vp: VerifiablePresentationDto,
    options: VerifyOptionsDto
  ): Promise<VerificationResultDto> {
    const w3cVerifyPresentationOptions: W3cVerifyPresentationOptions = {
      presentation: this.transformToCredoPresentation(vp, W3cJsonLdVerifiablePresentation),
      challenge: options.challenge ?? vp.proof.challenge
    };
    const verifyPresentation = await this.credoService.agent.w3cCredentials.verifyPresentation(
      w3cVerifyPresentationOptions
    );
    return transformVerificationResult(verifyPresentation);
  }

  /**
   * Since Credo 0.6 the proofPurpose option must be a jsonld-signatures
   * purpose instance rather than a purpose string.
   */
  private toProofPurposeInstance(proofPurpose?: ProofPurpose, challenge?: string, domain?: string) {
    if (!proofPurpose) {
      return undefined;
    }
    switch (proofPurpose) {
      case ProofPurpose.authentication:
        return new purposes.AuthenticationProofPurpose({ challenge, domain });
      case ProofPurpose.assertionMethod:
        return new purposes.AssertionProofPurpose();
      default:
        throw new BadRequestException(`unsupported proof purpose: ${proofPurpose}`);
    }
  }

  private async getVerificationMethodForDid(did: string): Promise<VerificationMethod> {
    const didDoc = await this.didService.getDID(did);

    if (!didDoc) {
      throw new BadRequestException(`DID="${did}" does not exist`);
    }

    return didDoc.verificationMethod[0];
  }

  /**
   * Credo is expecting the the verifiableCredential property in a presentation.
   * However, this property is optional in both the v1.1 and v2 VC data models.
   * For example, it isn't present if the presentation is only for authentication.
   * Credo issue to resolve underlying cause: https://github.com/openwallet-foundation/credo-ts/issues/2038
   * @param presentation presentation to transform to a Credo type
   * @param targetClass the desired Credo type
   * @returns instance of targetClass
   */
  private transformToCredoPresentation<T extends W3cPresentation>(
    presentation,
    targetClass: new (...args: unknown[]) => T
  ): T {
    return JsonTransformer.fromJSON(presentation, targetClass, {
      validate: !(presentation.verifiableCredential === undefined)
    });
  }
}
