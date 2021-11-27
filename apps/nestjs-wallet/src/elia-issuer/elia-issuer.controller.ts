import { Controller, Get, Param, Post } from '@nestjs/common';
import { CredentialOfferDto } from './dtos/credential-offer.dto';
import { EliaIssuerService } from './elia-issuer.service';
import { WorkflowRequestResponse } from './types/workflow-request-response';
import { WorkflowType } from './types/workflow-type';
import { EnumValueValidationPipe } from './validation-pipes/enum-value.pipe';

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
  ): Promise<WorkflowRequestResponse> {
    return this.eliaIssuerService.startWorkflow(workflowType);
  }
}
