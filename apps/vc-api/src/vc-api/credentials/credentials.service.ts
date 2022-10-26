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

import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  issueCredential,
  verifyCredential,
  issuePresentation,
  verifyPresentation,
  DIDAuth
} from '@spruceid/didkit-wasm-node';
import { JWK } from 'jose';
import { DIDService } from '../../did/did.service';
import { KeyService } from '../../key/key.service';
import { IssueOptionsDto } from './dtos/issue-options.dto';
import { IssueCredentialDto } from './dtos/issue-credential.dto';
import { VerifiableCredentialDto } from './dtos/verifiable-credential.dto';
import { VerifiablePresentationDto } from './dtos/verifiable-presentation.dto';
import { VerifyOptionsDto } from './dtos/verify-options.dto';
import { VerificationResultDto } from './dtos/verification-result.dto';
import { AuthenticateDto } from './dtos/authenticate.dto';
import { ProvePresentationDto } from './dtos/prove-presentation.dto';
import { CredentialVerifier } from './types/credential-verifier';
import { PresentationDto } from './dtos/presentation.dto';
import { IPresentationDefinition, IVerifiableCredential, PEX, ProofPurpose, Status } from '@sphereon/pex';
import { VerificationMethod } from 'did-resolver';
import { ProvePresentationOptionsDto } from './dtos/prove-presentation-options.dto';
import { didKitExecutor } from './utils/did-kit-executor.function';

/**
 * Credential issuance options that Spruce accepts
 * Full options are here: https://github.com/spruceid/didkit/blob/main/cli/README.md#didkit-vc-issue-credential
 */
interface ISpruceIssueOptions {
  proofPurpose: string;
  verificationMethod: string;
  created?: string;
  challenge?: string;
}

/**
 * Credential verification options that Spruce accepts
 * Full options are here: https://github.com/spruceid/didkit/blob/main/cli/README.md#didkit-vc-verify-credential
 */
interface ISpruceVerifyOptions {
  challenge?: string;
}

/**
 * This service provide the VC-API operations
 * This encapsulates the use of Spruce DIDKit
 */
@Injectable()
export class CredentialsService implements CredentialVerifier {
  constructor(private didService: DIDService, private keyService: KeyService) {}

  async issueCredential(issueDto: IssueCredentialDto): Promise<VerifiableCredentialDto> {
    const verificationMethod = await this.getVerificationMethodForDid(
      typeof issueDto.credential.issuer === 'string'
        ? issueDto.credential.issuer
        : issueDto.credential.issuer.id
    );
    const key = await this.getKeyForVerificationMethod(verificationMethod.id);
    const proofOptions = this.mapVcApiIssueOptionsToSpruceIssueOptions(
      issueDto.options || ({} as IssueOptionsDto),
      verificationMethod.id
    );

    return didKitExecutor<VerifiableCredentialDto>(
      () =>
        issueCredential(
          JSON.stringify(issueDto.credential),
          JSON.stringify(proofOptions),
          JSON.stringify(key)
        ),
      'issueCredential'
    );
  }

  async verifyCredential(
    vc: VerifiableCredentialDto,
    options: VerifyOptionsDto
  ): Promise<VerificationResultDto> {
    const verifyOptions: ISpruceVerifyOptions = options;

    return didKitExecutor<VerificationResultDto>(
      () => verifyCredential(JSON.stringify(vc), JSON.stringify(verifyOptions)),
      'verifyCredential'
    );
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

    // embed submission context to workaround failing to load context 'https://identity.foundation/presentation-exchange/submission/v1'
    const submissionContext = {
      PresentationSubmission: {
        '@id': 'https://identity.foundation/presentation-exchange/#presentation-submission',
        '@context': {
          '@version': '1.1',
          presentation_submission: {
            '@id': 'https://identity.foundation/presentation-exchange/#presentation-submission',
            '@type': '@json'
          }
        }
      }
    };
    const submissionContextUri = 'https://identity.foundation/presentation-exchange/submission/v1';

    presentation['@context'] = Array.isArray(presentation['@context'])
      ? presentation['@context']
      : [presentation['@context']];

    presentation['@context'] = presentation['@context'].filter((c) => c !== submissionContextUri);
    presentation['@context'].push(submissionContext as any);
    return presentation as PresentationDto;
  }

  async provePresentation(provePresentationDto: ProvePresentationDto): Promise<VerifiablePresentationDto> {
    const verificationMethodId =
      provePresentationDto.options.verificationMethod ??
      (await this.getVerificationMethodForDid(provePresentationDto.presentation.holder)).id;
    const key = await this.getKeyForVerificationMethod(verificationMethodId);
    const proofOptions = this.mapVcApiPresentationOptionsToSpruceIssueOptions(provePresentationDto.options);

    return didKitExecutor<VerifiablePresentationDto>(
      () =>
        issuePresentation(
          JSON.stringify(provePresentationDto.presentation),
          JSON.stringify(proofOptions),
          JSON.stringify(key)
        ),
      'issuePresentation'
    );
  }

  /**
   * Provide authentication as DID in response to DIDAuth Request
   * https://w3c-ccg.github.io/vp-request-spec/#did-authentication-request
   */
  async didAuthenticate(authenticateDto: AuthenticateDto): Promise<VerifiablePresentationDto> {
    if (authenticateDto.options.proofPurpose !== ProofPurpose.authentication) {
      throw new BadRequestException('proof purpose must be authentication for DIDAuth');
    }

    const verificationMethodId =
      authenticateDto.options.verificationMethod ??
      (await this.getVerificationMethodForDid(authenticateDto.did)).id;

    const key = await this.getKeyForVerificationMethod(verificationMethodId);
    const proofOptions = this.mapVcApiPresentationOptionsToSpruceIssueOptions(authenticateDto.options);

    return didKitExecutor<VerifiablePresentationDto>(
      () => DIDAuth(authenticateDto.did, JSON.stringify(proofOptions), JSON.stringify(key)),
      'DIDAuth'
    );
  }

  async verifyPresentation(
    vp: VerifiablePresentationDto,
    options: VerifyOptionsDto
  ): Promise<VerificationResultDto> {
    const verifyOptions: ISpruceVerifyOptions = options;

    return didKitExecutor<VerificationResultDto>(
      () => verifyPresentation(JSON.stringify(vp), JSON.stringify(verifyOptions)),
      'verifyPresentation'
    );
  }

  private async getVerificationMethodForDid(did: string): Promise<VerificationMethod> {
    const didDoc = await this.didService.getDID(did);

    if (!didDoc) {
      throw new BadRequestException(`DID="${did}" does not exist`);
    }

    return didDoc.verificationMethod[0];
  }

  /**
   * TODO: Maybe we should check if the issuer of the credential controls the associated verification method
   * @param desiredVerificationMethod
   * @returns the privateKey that can issue proofs as the verification method
   */
  private async getKeyForVerificationMethod(desiredVerificationMethodId: string): Promise<JWK> {
    const verificationMethod = await this.didService.getVerificationMethod(desiredVerificationMethodId);
    if (!verificationMethod) {
      throw new InternalServerErrorException('This verification method is not known to this wallet');
    }
    const keyID = verificationMethod.publicKeyJwk?.kid;
    if (!keyID) {
      throw new InternalServerErrorException(
        'There is no key ID (kid) associated with this verification method. Unable to retrieve private key'
      );
    }
    const privateKey = await this.keyService.getPrivateKeyFromKeyId(keyID);
    if (!privateKey) {
      throw new InternalServerErrorException('Unable to retrieve private key for this verification method');
    }
    return privateKey;
  }

  /**
   * As the Spruce proof issuance options may not align perfectly with the VC-API spec issuanceOptions,
   * this method provides a translation between the two
   * @param options
   * @returns
   */
  private mapVcApiIssueOptionsToSpruceIssueOptions(
    options: IssueOptionsDto,
    verificationMethodId: string
  ): ISpruceIssueOptions {
    return {
      proofPurpose: ProofPurpose.assertionMethod, // Issuance is always an "assertion" proof, AFAIK
      verificationMethod: verificationMethodId,
      created: options.created,
      challenge: options.challenge
    };
  }

  /**
   * As the Spruce proof presentation options may not align perfectly with the VC-API spec provePresentationOptions,
   * this method provides a translation between the two
   * @param options
   * @returns
   */
  private mapVcApiPresentationOptionsToSpruceIssueOptions(
    options: ProvePresentationOptionsDto
  ): ISpruceIssueOptions {
    return {
      proofPurpose: options.proofPurpose,
      verificationMethod: options.verificationMethod,
      created: options.created,
      challenge: options.challenge
    };
  }
}
