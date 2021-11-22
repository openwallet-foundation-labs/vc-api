import { Body, Controller, Post } from '@nestjs/common';
import { DIDService } from '../did/did.service';
import { KeyService } from '../key/key.service';
import { CredentialsService } from './credentials.service';
import { IssueDto } from './dto/issue.dto';
import { VerifiableCredentialDto } from './dto/verifiable-credential.dto';

/**
 * Credentials API conforms to W3C vc-api
 * https://github.com/w3c-ccg/vc-api
 */
@Controller('credentials')
export class CredentialsController {
  constructor(
    private credentialsService: CredentialsService,
    private didService: DIDService,
    private keyService: KeyService
  ) {}

  /**
   * Issues a credential and returns it in the response body. Conforms to https://w3c-ccg.github.io/vc-api/issuer.html
   * @param issueDto credential without a proof, and, proof options
   * @returns a verifiable credential
   */
  @Post('issue')
  async issue(@Body() issueDto: IssueDto): Promise<VerifiableCredentialDto> {
    const verificationMethod = await this.didService.getVerificationMethod(
      issueDto.options.verificationMethod
    );
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
    // TODO: Maybe we should check if the issuer of the credential has the associated verification method
    const vc = await this.credentialsService.issueCredential(
      issueDto.credential,
      issueDto.options,
      privateKey
    );
    return JSON.parse(vc);
  }

  // VERIFIER https://w3c-ccg.github.io/vc-api/verifier.html

  // HOLDER https://w3c-ccg.github.io/vc-api/holder.html
}
