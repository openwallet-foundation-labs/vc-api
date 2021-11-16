import { Injectable } from '@nestjs/common';
import { issueCredential, verifyCredential } from '@spruceid/didkit-wasm-node';
import { JWK } from 'jose';
import { CredentialDto } from './dto/credential.dto';
import { IssueCredentialOptionsDto } from './dto/issue-credential-options.dto';
import { VerifiableCredentialDto } from './dto/verifiable-credential.dto';
import { VerifyCredentialOptionsDto } from './dto/verify-credential-options.dto';

/**
 * Credential issuance options that Spruce accepts
 * Full options are here: https://github.com/spruceid/didkit/blob/main/cli/README.md#didkit-vc-issue-credential
 */
interface ISpruceIssueOptions {
  proofPurpose: string;
  verificationMethod: string;
  created?: string;
}

/**
 * Credential verification options that Spruce accepts
 * Full options are here: https://github.com/spruceid/didkit/blob/main/cli/README.md#didkit-vc-verify-credential
 */
interface ISpruceVerifyOptions {}

/**
 * This service encapsulates the use of Spruce DIDKit for credential operations
 */
@Injectable()
export class CredentialsService {
  async issueCredential(credential: CredentialDto, options: IssueCredentialOptionsDto, key: JWK) {
    const proofOptions: ISpruceIssueOptions = {
      proofPurpose: options.proofPurpose,
      verificationMethod: options.verificationMethod,
      created: options.created
    };
    return await issueCredential(
      JSON.stringify(credential),
      JSON.stringify(proofOptions),
      JSON.stringify(key)
    );
  }

  async verifyCredential(vc: VerifiableCredentialDto, options: VerifyCredentialOptionsDto) {
    const proofOptions: ISpruceVerifyOptions = {};
    return await verifyCredential(JSON.stringify(vc), JSON.stringify(proofOptions));
  }
}
