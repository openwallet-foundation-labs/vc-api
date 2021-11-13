import { Injectable } from '@nestjs/common';
import { issueCredential } from '@spruceid/didkit-wasm-node';
import { JWK } from 'jose';
import { CredentialDto } from './dto/credential.dto';
import { IssueCredentialOptionsDto } from './dto/issue-credential-options.dto';

/**
 * ProofOptions that Spruce accepts
 * TODO: see if Spruce has documentation somewhere on the complete options
 */
interface ISpruceProofOptions {
  proofPurpose: string;
  verificationMethod: string;
}

/**
 * This service encapsulates the use of Spruce
 */
@Injectable()
export class CredentialsService {
  async issueCredential(credential: CredentialDto, options: IssueCredentialOptionsDto, key: JWK) {
    const proofOptions: ISpruceProofOptions = {
      proofPurpose: options.proofPurpose,
      verificationMethod: options.verificationMethod
    };
    return await issueCredential(
      JSON.stringify(credential),
      JSON.stringify(proofOptions),
      JSON.stringify(key)
    );
  }
}
