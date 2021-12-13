import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { VerifiablePresentationDto } from '../vc-api/dto/verifiable-presentation.dto';
import { CredentialOfferDto } from './dtos/credential-offer.dto';
import { EliaIssuerService, IssuingDID } from './elia-issuer.service';
import { WorkflowResponseDto } from './dtos/workflow-response.dto';
import { WorkflowType } from './types/workflow-type';
import { EnumValueValidationPipe } from './validation-pipes/enum-value.pipe';
import { IssuerDidDto } from './dtos/issuer-did.dto';

@Controller('elia-issuer')
export class EliaIssuerController {
  constructor(private eliaIssuerService: EliaIssuerService) {}

  @Get('/credential-offer')
  getCredentialOffer(): CredentialOfferDto {
    return this.eliaIssuerService.getCredentialOffer();
  }

  @Post('/start-workflow/:workflowtype')
  startWorkflow(
    @Param('workflowtype', new EnumValueValidationPipe(WorkflowType)) workflowType: WorkflowType
  ): Promise<WorkflowResponseDto> {
    return this.eliaIssuerService.startWorkflow(workflowType);
  }

  @Post('/active-flows/:flowid')
  async proveAuthenticationPresentation(
    @Param('flowid') flowId: string,
    @Body() presentation: VerifiablePresentationDto
  ): Promise<WorkflowResponseDto> {
    return await this.eliaIssuerService.continueWorkflow(presentation, flowId);
  }

  /**
   * Temporary approach to configure which DID to use to use to issue credentials
   * @param issuerDID
   */
  @Put('/set-issuer-did')
  setIssueDid(@Body() issuerDID: IssuerDidDto): void {
    this.eliaIssuerService.issuingDID = issuerDID;
  }
}
