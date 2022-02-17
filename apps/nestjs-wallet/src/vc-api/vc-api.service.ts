import { Injectable } from '@nestjs/common';
import {
  issueCredential,
  verifyCredential,
  issuePresentation,
  verifyPresentation,
  DIDAuth
} from '@spruceid/didkit-wasm-node';
import { JWK } from 'jose';
import { DIDService } from '../did/did.service';
import { KeyService } from '../key/key.service';
import { IssueOptionsDto } from './dtos/issue-options.dto';
import { IssueCredentialDto } from './dtos/issue-credential.dto';
import { PresentationDto } from './dtos/presentation.dto';
import { VerifiableCredentialDto } from './dtos/verifiable-credential.dto';
import { VerifiablePresentationDto } from './dtos/verifiable-presentation.dto';
import { VerifyOptionsDto } from './dtos/verify-options.dto';
import { VerifyProofResponseDto } from './dtos/verify-proof-response.dto';
import { AuthenticateDto } from './dtos/authenticate.dto';

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
export class VcApiService {
  constructor(private didService: DIDService, private keyService: KeyService) {}

  async issueCredential(issueDto: IssueCredentialDto): Promise<VerifiableCredentialDto> {
    const key = await this.getKeyForVerificationMethod(issueDto.options.verificationMethod);
    const proofOptions = this.mapVcApiIssueOptionsToSpruceIssueOptions(issueDto.options);
    return JSON.parse(
      await issueCredential(
        JSON.stringify(issueDto.credential),
        JSON.stringify(proofOptions),
        JSON.stringify(key)
      )
    );
  }

  async verifyCredential(
    vc: VerifiableCredentialDto,
    options: VerifyOptionsDto
  ): Promise<VerifyProofResponseDto> {
    const verifyOptions: ISpruceVerifyOptions = options;
    return JSON.parse(await verifyCredential(JSON.stringify(vc), JSON.stringify(verifyOptions)));
  }

  async issuePresentation(
    presentation: PresentationDto,
    options: IssueOptionsDto,
    key: JWK
  ): Promise<VerifiablePresentationDto> {
    const proofOptions = this.mapVcApiIssueOptionsToSpruceIssueOptions(options);
    return JSON.parse(
      await issuePresentation(JSON.stringify(presentation), JSON.stringify(proofOptions), JSON.stringify(key))
    );
  }

  /**
   * Provide authentication as DID in response to DIDAuth Request
   * https://w3c-ccg.github.io/vp-request-spec/#did-authentication-request
   */
  async didAuthenticate(authenticateDto: AuthenticateDto): Promise<VerifiablePresentationDto> {
    if (authenticateDto.options.proofPurpose !== 'authentication') {
      throw new Error('proof purpose must be authentication for DIDAuth');
    }
    const key = await this.getKeyForVerificationMethod(authenticateDto.options.verificationMethod);
    const proofOptions = this.mapVcApiIssueOptionsToSpruceIssueOptions(authenticateDto.options);
    return JSON.parse(await DIDAuth(authenticateDto.did, JSON.stringify(proofOptions), JSON.stringify(key)));
  }

  async verifyPresentation(
    vp: VerifiablePresentationDto,
    options: VerifyOptionsDto
  ): Promise<VerifyProofResponseDto> {
    const verifyOptions: ISpruceVerifyOptions = options;
    return JSON.parse(await verifyPresentation(JSON.stringify(vp), JSON.stringify(verifyOptions)));
  }

  /**
   * TODO: Maybe we should check if the issuer of the credential controls the associated verification method
   * @param desiredVerificationMethod
   * @returns the privateKey that can issue proofs as the verification method
   */
  private async getKeyForVerificationMethod(desiredVerificationMethod: string): Promise<JWK> {
    const verificationMethod = await this.didService.getVerificationMethod(desiredVerificationMethod);
    if (!verificationMethod) {
      throw new Error('This verification method is not known to this wallet');
    }
    const keyID = verificationMethod.publicKeyJwk?.kid;
    if (!keyID) {
      throw new Error(
        'There is no key ID (kid) associated with this verification method. Unable to retrieve private key'
      );
    }
    const privateKey = await this.keyService.getPrivateKeyFromKeyId(keyID);
    if (!privateKey) {
      throw new Error('Unable to retrieve private key for this verification method');
    }
    return privateKey;
  }

  /**
   * As the Spruce proof issuance options may not align perfectly with the VC-API spec,
   * this method provides a translation between the two
   * @param options
   * @returns
   */
  private mapVcApiIssueOptionsToSpruceIssueOptions(options: IssueOptionsDto): ISpruceIssueOptions {
    return {
      proofPurpose: options.proofPurpose,
      verificationMethod: options.verificationMethod,
      created: options.created,
      challenge: options.challenge
    };
  }
}
