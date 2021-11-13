import { Injectable } from '@nestjs/common';
import { issueCredential } from '@spruceid/didkit-wasm-node';

@Injectable()
export class CredentialsService {
  async issueCredential(credential: string, proofOptions: string, key: string) {
    return await issueCredential(credential, proofOptions, key);
  }
}
