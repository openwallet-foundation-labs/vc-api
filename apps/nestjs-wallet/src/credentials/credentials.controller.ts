import { Body, Controller, Post } from '@nestjs/common';
import { DIDService } from '../did/did.service';
import { KeyService } from '../key/key.service';
import { CredentialsService } from './credentials.service';
import { CredentialDto } from './dto/credential.dto';
import { IssueCredentialOptionsDto } from './dto/issue-credential-options.dto';

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

  // ISSUER https://w3c-ccg.github.io/vc-api/issuer.html
  @Post('issue')
  async issue(@Body() credential: CredentialDto, @Body() options: IssueCredentialOptionsDto): Promise<any> {
    const verificationMethod = await this.didService.getVerificationMethod(options.verificationMethod);
    if (!verificationMethod) {
      throw new Error('This verification method is not known to this wallet');
    }
    const keyID = verificationMethod.publicKeyJwk?.kid;
    if (!keyID) {
      throw new Error(
        'There is not key ID (kid) associated with this verification method. Unable to retrieve private key'
      );
    }
    const privateKey = await this.keyService.getPublicKeyFromKeyId(keyID);
    if (!privateKey) {
      throw new Error('Unable to retrieve private key for this verification method');
    }
    // TODO: Maybe we should check if the issuer of the credential has the associated verification method
    return await this.credentialsService.issueCredential(credential, options, privateKey);
  }

  // VERIFIER https://w3c-ccg.github.io/vc-api/verifier.html
  // HOLDER https://w3c-ccg.github.io/vc-api/holder.html
}
