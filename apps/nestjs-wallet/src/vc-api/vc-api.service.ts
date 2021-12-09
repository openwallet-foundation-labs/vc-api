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
import { CredentialDto } from './dto/credential.dto';
import { IssueOptionsDto } from './dto/issue-options.dto';
import { PresentationDto } from './dto/presentation.dto';
import { VerifiableCredentialDto } from './dto/verifiable-credential.dto';
import { VerifiablePresentationDto } from './dto/verifiable-presentation.dto';
import { VerifyOptionsDto } from './dto/verify-options.dto';

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
 * This service encapsulates the use of Spruce DIDKit for credential operations
 */
@Injectable()
export class VcApiService {
  constructor(private didService: DIDService, private keyService: KeyService) {}

  async issueCredential(
    credential: CredentialDto,
    options: IssueOptionsDto,
    key: JWK
  ): Promise<VerifiableCredentialDto> {
    const proofOptions = this.mapVcApiIssueOptionsToSpruceIssueOptions(options);
    return JSON.parse(
      await issueCredential(JSON.stringify(credential), JSON.stringify(proofOptions), JSON.stringify(key))
    );
  }

  async verifyCredential(vc: VerifiableCredentialDto, options: VerifyOptionsDto) {
    const verifyOptions: ISpruceVerifyOptions = options;
    return await verifyCredential(JSON.stringify(vc), JSON.stringify(verifyOptions));
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
  async didAuthenticate(
    holder: string,
    options: IssueOptionsDto,
    key: JWK
  ): Promise<VerifiablePresentationDto> {
    if (options.proofPurpose !== 'authentication') {
      throw new Error('proof purpose must be authentication for DIDAuth');
    }
    const proofOptions = this.mapVcApiIssueOptionsToSpruceIssueOptions(options);
    return JSON.parse(await DIDAuth(holder, JSON.stringify(proofOptions), JSON.stringify(key)));
  }

  async verifyPresentation(vp: VerifiablePresentationDto, options: VerifyOptionsDto) {
    const verifyOptions: ISpruceVerifyOptions = options;
    return JSON.parse(await verifyPresentation(JSON.stringify(vp), JSON.stringify(verifyOptions)));
  }

  /**
   * TODO: Maybe we should check if the issuer of the credential controls the associated verification method
   * @param desiredVerificationMethod
   * @returns the privateKey that can issue proofs as the verification method
   */
  async getKeyForVerificationMethod(desiredVerificationMethod: string): Promise<JWK> {
    const verificationMethod = await this.didService.getVerificationMethod(desiredVerificationMethod);
    if (!verificationMethod) {
      throw new Error('This verification method is not known to this wallet');
    }
    const keyID = verificationMethod.publicKeyJwk?.kid;
    if (!keyID) {
      throw new Error(
        'There is not key ID (kid) associated with this verification method. Unable to retrieve private key'
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
