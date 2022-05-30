/**
 * Copyright 2021, 2022 Energy Web Foundation
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IPresentationDefinition } from '@sphereon/pex';
import { CredentialsService } from './credentials/credentials.service';
import { IssueCredentialDto } from './credentials/dtos/issue-credential.dto';
import { VerifiableCredentialDto } from './credentials/dtos/verifiable-credential.dto';
import { AuthenticateDto } from './credentials/dtos/authenticate.dto';
import { VerifiablePresentationDto } from './credentials/dtos/verifiable-presentation.dto';
import { ExchangeService } from './exchanges/exchange.service';
import { ExchangeResponseDto } from './exchanges/dtos/exchange-response.dto';
import { ExchangeDefinitionDto } from './exchanges/dtos/exchange-definition.dto';
import { ProvePresentationDto } from './credentials/dtos/prove-presentation.dto';
import { VerifyCredentialDto } from './credentials/dtos/verify-credential.dto';
import { GetTransactionDto } from './exchanges/dtos/get-transaction.dto';
import { TransactionDto } from './exchanges/dtos/transaction.dto';
import { SubmissionReviewDto } from './exchanges/dtos/submission-review.dto';
import { PresentationDto } from './credentials/dtos/presentation.dto';
import { VerificationResultDto } from './credentials/dtos/verification-result.dto';

/**
 * VcApi API conforms to W3C vc-api
 * https://github.com/w3c-ccg/vc-api
 */
@ApiTags('vc-api')
@Controller('vc-api')
export class VcApiController {
  constructor(private vcApiService: CredentialsService, private exchangeService: ExchangeService) {}

  /**
   * Issues a credential and returns it in the response body. Conforms to https://w3c-ccg.github.io/vc-api/issuer.html
   * @param issueDto credential without a proof, and, proof options
   * @returns a verifiable credential
   */
  @Post('credentials/issue')
  async issueCredential(@Body() issueDto: IssueCredentialDto): Promise<VerifiableCredentialDto> {
    return await this.vcApiService.issueCredential(issueDto);
  }

  /**
   * Verify a credential. Conforms to https://w3c-ccg.github.io/vc-api/#verify-credential
   * @returns verification results: checks, warnings, errors
   */
  @Post('/credentials/verify')
  async verifyCredential(
    @Body()
    verifyCredentialDto: VerifyCredentialDto
  ): Promise<VerificationResultDto> {
    return await this.vcApiService.verifyCredential(verifyCredentialDto.vc, verifyCredentialDto.options);
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

  /**
   * Creates a Presentation without Proof by passing in the Presentation Definition, selected Verifiable Credentials (TODO: and an optional holder (DID)).
   * The presentation contains the [presentation submission](https://identity.foundation/presentation-exchange/#presentation-submission) data that the verifier can use.
   */
  @Post('presentations/from')
  async presentationFrom(
    @Body()
    {
      presentationDefinition,
      credentials
    }: {
      presentationDefinition: IPresentationDefinition;
      credentials: VerifiableCredentialDto[];
    }
  ): Promise<PresentationDto> {
    return this.vcApiService.presentationFrom(presentationDefinition, credentials);
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
    return await this.exchangeService.continueExchange(presentation, transactionId);
  }

  /**
   * Get exchange transaction by id
   * A NON-STANDARD endpoint currently.
   * Similar to https://identitycache.energyweb.org/api/#/Claims/ClaimController_getByIssuerDid
   *
   * TODO: Needs to have special authorization. For SSI-Hub it is by DID
   * @param exchangeId id of the exchange
   * @param transactionId id of the exchange transaction
   * @returns
   */
  @Get('/exchanges/:exchangeId/:transactionId')
  async getTransaction(
    @Param('exchangeId') exchangeId: string,
    @Param('transactionId') transactionId: string
  ) {
    const queryResult = await this.exchangeService.getExchangeTransaction(transactionId);
    const transactionDto = queryResult.transaction
      ? TransactionDto.toDto(queryResult.transaction)
      : undefined;
    const response: GetTransactionDto = {
      errors: queryResult.errors,
      transaction: transactionDto
    };
    return response;
  }

  /**
   * Update a transaction review
   * A NON-STANDARD endpoint currently.
   * Similar to https://github.com/energywebfoundation/ssi-hub/blob/8b860e7cdae4e1b1aa75afeab8b9df7ab26befbb/src/modules/claim/claim.controller.ts#L80
   *
   * TODO: Perhaps reviews are not separate from transactions? Perhaps one updates the transaction directly
   * TODO: Needs to have special authorization
   * @param exchangeId id of the exchange
   * @param transactionId id of the exchange transaction
   * @returns
   */
  @Post('/exchanges/:exchangeId/:transactionId/review')
  async addSubmissionReview(
    @Param('transactionId') transactionId: string,
    @Body() submissionReview: SubmissionReviewDto
  ) {
    return await this.exchangeService.addReview(transactionId, submissionReview);
  }
}
