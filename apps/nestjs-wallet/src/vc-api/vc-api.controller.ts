import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VcApiService } from './vc-api.service';
import { IssueCredentialDto } from './dtos/issue-credential.dto';
import { VerifiableCredentialDto } from './dtos/verifiable-credential.dto';
import { AuthenticateDto } from './dtos/authenticate.dto';
import { VerifiablePresentationDto } from './dtos/verifiable-presentation.dto';
import { ExchangeService } from './exchanges/exchange.service';
import { ExchangeResponseDto } from './exchanges/dtos/exchange-response.dto';
import { ExchangeDefinitionDto } from './exchanges/dtos/exchange-definition.dto';

/**
 * VcApi API conforms to W3C vc-api
 * https://github.com/w3c-ccg/vc-api
 */
@ApiTags('vc-api')
@Controller('vc-api')
export class VcApiController {
  constructor(private vcApiService: VcApiService, private exchangeService: ExchangeService) {}

  /**
   * Issues a credential and returns it in the response body. Conforms to https://w3c-ccg.github.io/vc-api/issuer.html
   * @param issueDto credential without a proof, and, proof options
   * @returns a verifiable credential
   */
  @Post('credentials/issue')
  async issueCredential(@Body() issueDto: IssueCredentialDto): Promise<VerifiableCredentialDto> {
    return await this.vcApiService.issueCredential(issueDto);
  }

  // VERIFIER https://w3c-ccg.github.io/vc-api/verifier.html

  // HOLDER/PRESENTER
  // https://w3c-ccg.github.io/vc-api/#presenting
  // https://w3c-ccg.github.io/vc-api/holder.html

  /**
   * TODO: Needs to have special authorization
   * Maybe better as config files?
   * @param exchangeDefinitionDto
   * @returns
   */
  @Post('/exchanges/configure')
  async configureExchange(@Body() exchangeDefinitionDto: ExchangeDefinitionDto) {
    return this.exchangeService.configureWorkflow(exchangeDefinitionDto);
  }

  @Post('/exchanges/:exchangeId')
  async initiateExchange(@Param('exchangeId') exchangeId: string): Promise<ExchangeResponseDto> {
    return this.exchangeService.startExchange(exchangeId);
  }

  @Put('/exchanges/:exchangeId/:transactionId')
  async continueExchange(
    @Param('exchangeId') exchangeId: string,
    @Param('transactionId') transactionId: string,
    @Body() presentation: VerifiablePresentationDto
  ): Promise<ExchangeResponseDto> {
    return await this.exchangeService.handlePresentation(presentation, transactionId, exchangeId);
  }

  /**
   * Issue a DIDAuth presentation that authenticates a DID.
   * Not a part of VC-API? Maybe there is a DID Auth spec though?
   * @param authenticateDto DID to authenticate as, and, proof options
   * @returns a verifiable presentation
   */
  @Post('presentations/prove/authentication')
  async proveAuthenticationPresentation(
    @Body() authenticateDto: AuthenticateDto
  ): Promise<VerifiablePresentationDto> {
    return await this.vcApiService.didAuthenticate(authenticateDto);
  }
}
