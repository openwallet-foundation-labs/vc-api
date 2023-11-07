/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
  Res
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath
} from '@nestjs/swagger';
import { Response } from 'express';
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
import { TransactionDto } from './exchanges/dtos/transaction.dto';
import { SubmissionReviewDto } from './exchanges/dtos/submission-review.dto';
import { PresentationDto } from './credentials/dtos/presentation.dto';
import { VerificationResultDto } from './credentials/dtos/verification-result.dto';
import { VerifyPresentationDto } from './credentials/dtos/verify-presentation.dto';
import { BadRequestErrorResponseDto } from '../dtos/bad-request-error-response.dto';
import { ConflictErrorResponseDto } from '../dtos/conflict-error-response.dto';
import { NotFoundErrorResponseDto } from '../dtos/not-found-error-response.dto';
import { InternalServerErrorResponseDto } from '../dtos/internal-server-error-response.dto';

/**
 * VcApi API conforms to W3C vc-api
 * https://github.com/w3c-ccg/vc-api
 */
@ApiTags('vc-api')
@Controller('vc-api')
@ApiBadRequestResponse({ type: BadRequestErrorResponseDto })
@ApiInternalServerErrorResponse({ type: InternalServerErrorResponseDto })
export class VcApiController {
  private readonly logger = new Logger(VcApiController.name, { timestamp: true });

  constructor(private vcApiService: CredentialsService, private exchangeService: ExchangeService) {}

  /**
   * @param issueDto credential without a proof, and, proof options
   * @returns a verifiable credential
   */
  @Post('credentials/issue')
  @ApiOperation({
    description:
      'Issues a credential and returns it in the response body. ' +
      'Conforms to https://w3c-ccg.github.io/vc-api/issuer.html'
  })
  @ApiBody({ type: IssueCredentialDto })
  @ApiCreatedResponse({ type: VerifiableCredentialDto })
  async issueCredential(@Body() issueDto: IssueCredentialDto): Promise<VerifiableCredentialDto> {
    return await this.vcApiService.issueCredential(issueDto);
  }

  /**
   * @returns verification results: checks, warnings, errors
   */
  @Post('/credentials/verify')
  @ApiOperation({
    description: 'Verify a credential. Conforms to https://w3c-ccg.github.io/vc-api/#verify-credential'
  })
  @ApiBody({ type: VerifyCredentialDto })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Verifiable Credential successfully verified', type: VerificationResultDto })
  @ApiBadRequestResponse({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(VerificationResultDto) },
        { $ref: getSchemaPath(BadRequestErrorResponseDto) }
      ]
    }
  })
  async verifyCredential(
    @Body()
    verifyCredentialDto: VerifyCredentialDto
  ): Promise<VerificationResultDto> {
    const verificationResult = await this.vcApiService.verifyCredential(
      verifyCredentialDto.verifiableCredential,
      verifyCredentialDto.options
    );

    if (verificationResult.errors.length > 0) {
      throw new BadRequestException(verificationResult);
    }

    return verificationResult;
  }

  // VERIFIER https://w3c-ccg.github.io/vc-api/verifier.html

  // HOLDER/PRESENTER
  // https://w3c-ccg.github.io/vc-api/#presenting
  // https://w3c-ccg.github.io/vc-api/holder.html

  /**
   * @param authenticateDto DID to authenticate as, and, proof options
   * @returns a verifiable presentation
   */
  @Post('presentations/prove/authentication')
  @ApiOperation({
    description:
      'Issue a DIDAuth presentation that authenticates a DID.\n' +
      'Not a part of VC-API? Maybe there is a DID Auth spec though?\n' +
      'A NON-STANDARD endpoint currently.'
  })
  @ApiBody({ type: AuthenticateDto })
  @ApiCreatedResponse({ type: VerifiablePresentationDto })
  async proveAuthenticationPresentation(
    @Body() authenticateDto: AuthenticateDto
  ): Promise<VerifiablePresentationDto> {
    return await this.vcApiService.didAuthenticate(authenticateDto);
  }

  @Post('presentations/from')
  @ApiOperation({
    description:
      'Creates a Presentation without Proof by passing in the Presentation Definition, selected Verifiable Credentials (TODO: and an optional holder (DID)).\n' +
      'The presentation contains the [presentation submission](https://identity.foundation/presentation-exchange/#presentation-submission) data that the verifier can use.'
  })
  //TODO: define request body DTO class
  @ApiCreatedResponse({ type: PresentationDto })
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
  @ApiBody({ type: ProvePresentationDto })
  @ApiCreatedResponse({ type: VerifiablePresentationDto })
  async provePresentation(
    @Body() provePresentationDto: ProvePresentationDto
  ): Promise<VerifiablePresentationDto> {
    return await this.vcApiService.provePresentation(provePresentationDto);
  }

  /**
   * @returns verification results: checks, warnings, errors
   */
  @Post('presentations/verify')
  @ApiOperation({
    description: 'Verify a presentation. Conforms to https://w3c-ccg.github.io/vc-api/#verify-presentation'
  })
  @ApiBody({ type: VerifyPresentationDto })
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Verifiable Presentation successfully verified!',
    type: VerificationResultDto
  })
  @ApiResponse({ status: 400, description: 'Invalid or malformed input' })
  async verifyPresentation(
    @Body() verifyPresentation: VerifyPresentationDto
  ): Promise<VerificationResultDto> {
    return this.vcApiService.verifyPresentation(
      verifyPresentation.verifiablePresentation,
      verifyPresentation.options
    );
  }

  /**
   * TODO: Needs to have special authorization
   * @param exchangeDefinitionDto
   * @returns
   */
  @Post('/exchanges')
  @ApiOperation({
    description:
      'Allows the creation of a new exchange by providing the credential query and interaction endpoints\n' +
      'A NON-STANDARD endpoint currently.\n\n' +
      'Similar to https://gataca-io.github.io/vui-core/#/Presentations/post_api_v2_presentations'
  })
  @ApiBody({ type: ExchangeDefinitionDto })
  @ApiCreatedResponse() // TODO: define response DTO
  @ApiConflictResponse({ type: ConflictErrorResponseDto })
  async createExchange(@Body() exchangeDefinitionDto: ExchangeDefinitionDto) {
    return this.exchangeService.createExchange(exchangeDefinitionDto);
  }

  @Post('/exchanges/:exchangeId')
  @ApiOperation({
    description: 'Initiates an exchange of information.\nhttps://w3c-ccg.github.io/vc-api/#initiate-exchange'
  })
  @ApiCreatedResponse({ type: ExchangeResponseDto })
  @ApiNotFoundResponse({ type: NotFoundErrorResponseDto })
  async initiateExchange(@Param('exchangeId') exchangeId: string): Promise<ExchangeResponseDto> {
    return this.exchangeService.startExchange(exchangeId);
  }

  @Put('/exchanges/:exchangeId/:transactionId')
  @ApiOperation({
    description:
      'Receives information related to an existing exchange.\n' +
      'https://w3c-ccg.github.io/vc-api/#continue-exchange'
  })
  @ApiBody({ type: VerifiablePresentationDto })
  @ApiOkResponse({
    description: 'Verifiable Presentation successfully submitted and verified',
    type: ExchangeResponseDto
  })
  @ApiAcceptedResponse({
    description: 'Verifiable Presentation successfully submitted. Further review in progress.'
  })
  @ApiNotFoundResponse({ type: NotFoundErrorResponseDto })
  async continueExchangePut(
    @Param('exchangeId') exchangeId: string,
    @Param('transactionId') transactionId: string,
    @Body() presentation: VerifiablePresentationDto,
    @Res() res: Response
  ): Promise<ExchangeResponseDto | Response> {
    this.logger.warn(`PUT method to be deprecated for exchange continuation`);

    return this.continueExchange({ exchangeId, transactionId, presentation, res });
  }

  @Post('/exchanges/:exchangeId/:transactionId')
  @ApiOperation({
    description:
      'Receives information related to an existing exchange.\n' +
      'https://w3c-ccg.github.io/vc-api/#continue-exchange'
  })
  @ApiBody({ type: VerifiablePresentationDto })
  @ApiOkResponse({
    description: 'Verifiable Presentation successfully submitted and verified',
    type: ExchangeResponseDto
  })
  @ApiAcceptedResponse({
    description: 'Verifiable Presentation successfully submitted. Further review in progress.'
  })
  @ApiNotFoundResponse({ type: NotFoundErrorResponseDto })
  async continueExchangePost(
    @Param('exchangeId') exchangeId: string,
    @Param('transactionId') transactionId: string,
    @Body() presentation: VerifiablePresentationDto,
    @Res() res: Response
  ): Promise<ExchangeResponseDto | Response> {
    return this.continueExchange({ exchangeId, transactionId, presentation, res });
  }

  private async continueExchange(options: {
    exchangeId: string;
    transactionId: string;
    presentation: VerifiablePresentationDto;
    res: Response;
  }): Promise<ExchangeResponseDto | Response> {
    const { exchangeId, transactionId, presentation, res } = options;

    if (!(await this.exchangeService.getExchange(exchangeId))) {
      throw new NotFoundException(`exchangeId=${exchangeId} does not exist`);
    }

    const response = await this.exchangeService.continueExchange(presentation, transactionId);

    if (response.processingInProgress) {
      // Currently 5 second retry time is hardcoded but it could be dynamic based on the use case in the future
      res.status(202).setHeader('Retry-After', 5);
    }

    return res.send(response);
  }

  /**
   * TODO: Needs to have special authorization. For SSI-Hub it is by DID
   * @param exchangeId id of the exchange
   * @param transactionId id of the exchange transaction
   */
  @Get('/exchanges/:exchangeId/:transactionId')
  @ApiOperation({
    description:
      'Get exchange transaction by id\n' +
      'A NON-STANDARD endpoint currently.\n' +
      'Similar to https://identitycache.energyweb.org/api/#/Claims/ClaimController_getByIssuerDid'
  })
  @ApiOkResponse({ type: TransactionDto })
  @ApiNotFoundResponse({ type: NotFoundErrorResponseDto })
  async getTransaction(
    @Param('exchangeId') exchangeId: string,
    @Param('transactionId') transactionId: string
  ): Promise<TransactionDto> {
    if (!(await this.exchangeService.getExchange(exchangeId))) {
      throw new NotFoundException(`exchangeId=${exchangeId} does not exist`);
    }

    const transaction = await this.exchangeService.getExchangeTransaction(transactionId);

    if (!transaction) {
      throw new NotFoundException(`${transactionId}: no transaction found for this transaction id`);
    }

    return TransactionDto.toDto(transaction);
  }

  /**
   * TODO: Perhaps reviews are not separate from transactions? Perhaps one updates the transaction directly
   * TODO: Needs to have special authorization
   * @param exchangeId id of the exchange
   * @param transactionId id of the exchange transaction
   * @param submissionReview
   */
  @Post('/exchanges/:exchangeId/:transactionId/review')
  @ApiOperation({
    description:
      'Update a transaction review\n' +
      'A NON-STANDARD endpoint currently.\n' +
      'Similar to https://github.com/energywebfoundation/ssi-hub/blob/8b860e7cdae4e1b1aa75afeab8b9df7ab26befbb/src/modules/claim/claim.controller.ts#L80'
  })
  @ApiBody({ type: SubmissionReviewDto })
  // TODO: define response DTO
  @ApiCreatedResponse()
  @ApiNotFoundResponse({ type: NotFoundErrorResponseDto })
  async addSubmissionReview(
    @Param('exchangeId') exchangeId: string,
    @Param('transactionId') transactionId: string,
    @Body() submissionReview: SubmissionReviewDto
  ) {
    if (!(await this.exchangeService.getExchange(exchangeId))) {
      throw new NotFoundException(`exchangeId=${exchangeId} does not exist`);
    }

    const result = await this.exchangeService.addReview(transactionId, submissionReview);

    if (
      result.errors.length > 0 &&
      result.errors.includes(`${transactionId}: no transaction found for this transaction id`)
    ) {
      throw new NotFoundException(`transactionId=${transactionId} does not exist`);
    }

    return result;
  }
}
