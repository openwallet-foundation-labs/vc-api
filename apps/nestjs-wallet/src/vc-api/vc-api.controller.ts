import { Body, Controller, Get, NotImplementedException, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VcApiService } from './vc-api.service';
import { IssueCredentialDto } from './dtos/issue-credential.dto';
import { VerifiableCredentialDto } from './dtos/verifiable-credential.dto';
import { AuthenticateDto } from './dtos/authenticate.dto';
import { VerifiablePresentationDto } from './dtos/verifiable-presentation.dto';
import { ExchangeService } from './exchanges/exchange.service';
import { ExchangeResponseDto } from './exchanges/dtos/exchange-response.dto';
import { ExchangeDefinitionDto } from './exchanges/dtos/exchange-definition.dto';
import { ProvePresentationDto } from './dtos/prove-presentation.dto';

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
   * Issue a DIDAuth presentation that authenticates a DID.
   * Not a part of VC-API? Maybe there is a DID Auth spec though?
   * A NON-STANDARD endpoint currently.
   * @param authenticateDto DID to authenticate as, and, proof options
   * @returns a verifiable presentation
   */
  @Post('presentations/prove/authentication')
  async proveAuthenticationPresentation(
    @Body() authenticateDto: AuthenticateDto
  ): Promise<VerifiablePresentationDto> {
    return await this.vcApiService.didAuthenticate(authenticateDto);
  }

  @Post('presentations/prove')
  async provePresentation(
    @Body() provePresentationDto: ProvePresentationDto
  ): Promise<VerifiablePresentationDto> {
    return await this.vcApiService.provePresentation(provePresentationDto);
  }

  /**
   * Allows the creation of a new exchange by providing the credential query and interaction endpoints
   * A NON-STANDARD endpoint currently.
   *
   * Similar to https://gataca-io.github.io/vui-core/#/Presentations/post_api_v2_presentations
   *
   * TODO: Needs to have special authorization
   * @param exchangeDefinitionDto
   * @returns
   */
  @Post('/exchanges')
  async createExchange(@Body() exchangeDefinitionDto: ExchangeDefinitionDto) {
    return this.exchangeService.createExchange(exchangeDefinitionDto);
  }

  /**
   * Initiates an exchange of information.
   * https://w3c-ccg.github.io/vc-api/#initiate-exchange
   *
   * @param exchangeId
   * @returns
   */
  @Post('/exchanges/:exchangeId')
  async initiateExchange(@Param('exchangeId') exchangeId: string): Promise<ExchangeResponseDto> {
    return this.exchangeService.startExchange(exchangeId);
  }

  /**
   * Receives information related to an existing exchange.
   * https://w3c-ccg.github.io/vc-api/#continue-exchange
   *
   * @param exchangeId
   * @param transactionId
   * @param presentation
   * @returns
   */
  @Put('/exchanges/:exchangeId/:transactionId')
  async continueExchange(
    @Param('exchangeId') exchangeId: string,
    @Param('transactionId') transactionId: string,
    @Body() presentation: VerifiablePresentationDto
  ): Promise<ExchangeResponseDto> {
    return await this.exchangeService.continueExchange(presentation, transactionId, exchangeId);
  }

  /**
   * Get exchange transactions that require reviews
   * A NON-STANDARD endpoint currently.
   * Similar to https://identitycache.energyweb.org/api/#/Claims/ClaimController_getByIssuerDid
   *
   * TODO: Needs to have special authorization. For SSI-Hub it is by DID
   * @param exchangeId id of the exchange
   * @param transactionId id of the exchange transaction
   * @returns
   */
  @Get('/exchanges/reviews')
  async getExchangeReviews(@Param('transactionId') transactionId: string) {
    return new NotImplementedException();
  }

  /**
   * Update a review (or maybe a transaction needing a review)
   * A NON-STANDARD endpoint currently.
   * Similar to https://github.com/energywebfoundation/ssi-hub/blob/8b860e7cdae4e1b1aa75afeab8b9df7ab26befbb/src/modules/claim/claim.controller.ts#L80
   *
   * TODO: Perhaps reviews are not separate from transactions? Perhaps one updated the transaction directly
   * TODO: Needs to have special authorization
   * @param exchangeId id of the exchange
   * @param transactionId id of the exchange transaction
   * @returns
   */
  @Put('/exchanges/reviews/:transactionId')
  async getExchangeTransaction(@Param('transactionId') transactionId: string) {
    return new NotImplementedException();
  }
}
