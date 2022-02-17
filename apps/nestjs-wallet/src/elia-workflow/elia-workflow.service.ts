import { Injectable } from '@nestjs/common';
import { IssuanceWorkflowDefinition } from './types/issuance-workflow-definition';
import { VcApiService } from '../vc-api/vc-api.service';
import { WorkflowService } from '../vc-api/workflow/workflow.service';
import { WorkflowResponseDto } from '../vc-api/workflow/dtos/workflow-response.dto';
import { WorkflowName } from './types/workflow-type';
import { ResidentCardIssuanceWorkflow } from './workflow-definitions/resident-card-issuance.workflow';
import { VerifiablePresentationDto } from '../vc-api/dtos/verifiable-presentation.dto';
import { AckStatus } from '../vc-api/workflow/types/ack-status';
import { DIDService } from '../did/did.service';

@Injectable()
export class EliaWorkflowService {
  #workflowDefinitions: Record<string, IssuanceWorkflowDefinition>;

  constructor(
    private vcApiService: VcApiService,
    private workflowService: WorkflowService,
    private didService: DIDService
  ) {
    this.#workflowDefinitions = {
      [WorkflowName.permanent_resident_card_issuance]: new ResidentCardIssuanceWorkflow(
        vcApiService,
        didService
      )
    };
  }

  public async startWorkflow(workflowName: string): Promise<WorkflowResponseDto> {
    return this.workflowService.startWorkflow(workflowName);
  }

  public async handlePresentation(
    flowId: string,
    vp: VerifiablePresentationDto
  ): Promise<WorkflowResponseDto> {
    const getWorkflowDetailsResult = await this.workflowService.getWorkflowDetails(flowId);
    const workflowName = getWorkflowDetailsResult.workflowDetails.name;
    const workflowDefinition = this.#workflowDefinitions[workflowName];
    if (!workflowDefinition) {
      return {
        errors: [`${workflowName}: no workflow definition found for this workflowtype`],
        ack: { status: AckStatus.fail }
      };
    }
    const { errors, ack } = await this.workflowService.handlePresentation(vp, flowId);
    if (errors.length > 0 || ack.status === AckStatus.fail) {
      return {
        errors,
        ack
      };
    }
    return await workflowDefinition.handlePresentation(vp);
  }
}
