import { Body, Controller, Post } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CredentialDto } from './dto/credential.dto';
import { IssueCredentialOptionsDto } from './dto/issue-credential-options.dto';

/**
 * Credentials API conforms to W3C vc-api
 * https://github.com/w3c-ccg/vc-api
 */
@Controller('credentials')
export class CredentialsController {
  constructor(private credentialsService: CredentialsService) {}

  // ISSUER https://w3c-ccg.github.io/vc-api/issuer.html
  @Post("issue")
  async issue(@Body() credential: CredentialDto, @Body() options: IssueCredentialOptionsDto): Promise<any> {
    return await this.credentialsService.issueCredential(credential, );
  }
  // VERIFIER https://w3c-ccg.github.io/vc-api/verifier.html
  // HOLDER https://w3c-ccg.github.io/vc-api/holder.html
}
