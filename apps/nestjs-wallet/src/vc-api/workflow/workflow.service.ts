import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { VcApiService } from '../vc-api.service';
import { VpRequestEntity } from './entities/vp-request.entity';
import { VerifiablePresentationDto } from '../dtos/verifiable-presentation.dto';
import { ActiveFlowEntity } from './entities/active-flow.entity';
import { WorkflowResponseDto } from './dtos/workflow-response.dto';
import { VpRequestDto } from './dtos/vp-request.dto';
import { AckStatus } from './types/ack-status';
import { WorkflowDefinitionDto } from './dtos/workflow-definition.dto';
import { VpRequestInteractServiceDto } from './dtos/vp-request-interact-service.dto';
import { VpRequestInteractServiceType } from './types/vp-request-interact-service-type';

@Injectable()
export class WorkflowService {
  #workflowDefinitions: Record<string, WorkflowDefinitionDto> = {};

  constructor(
    private vcApiService: VcApiService,
    @InjectRepository(VpRequestEntity)
    private vpRequestRepository: Repository<VpRequestEntity>,
    @InjectRepository(ActiveFlowEntity)
    private activeFlowRepository: Repository<ActiveFlowEntity>
  ) {}

  public async configureWorkflow(workflowDefinitionDto: WorkflowDefinitionDto) {
    this.#workflowDefinitions[workflowDefinitionDto.workflowName] = workflowDefinitionDto;
  }

  /**
   * Starts a workflow to obtain a credential
   * @param workflowName
   * @returns workflow response
   */
  public async startWorkflow(workflowName: string): Promise<WorkflowResponseDto> {
    const workflowDefinition = this.#workflowDefinitions[workflowName];
    if (!workflowDefinition) {
      return {
        errors: [`${workflowName}: no workflow definition found for this workflowtype`],
        ack: { status: AckStatus.fail }
      };
    }
    const flowId = uuidv4();
    const challenge = uuidv4();
    const interactServices = workflowDefinition.interactServices.map((serviceDef) => {
      if (serviceDef.type === VpRequestInteractServiceType.unmediatedPresentation) {
        return {
          type: VpRequestInteractServiceType.unmediatedPresentation,
          serviceEndpoint: `${serviceDef.baseUrl}/workflows/${flowId}/presentations`
        };
      }
    });
    const vpRequest = this.vpRequestRepository.create({
      challenge,
      query: workflowDefinition.query,
      interact: {
        service: interactServices
      }
    });
    const activeFlow = this.activeFlowRepository.create({
      name: workflowName,
      id: flowId,
      vpRequests: [vpRequest]
    });
    await this.activeFlowRepository.save(activeFlow);
    return { errors: [], vpRequest: VpRequestDto.toDto(vpRequest), ack: { status: AckStatus.pending } };
  }

  /**
   * Handle a presentation submitted to a workflow
   * TODO: add logging of errors (using structured logs?)
   * @param verifiablePresentation
   * @param flowId
   * @returns workflow response
   */
  public async handlePresentation(
    verifiablePresentation: VerifiablePresentationDto,
    flowId: string
  ): Promise<WorkflowResponseDto> {
    const flow = await this.activeFlowRepository.findOne(flowId, { relations: ['vpRequests'] });
    if (!flow) {
      return { errors: [`${flowId}: no workflow found for this flowId`], ack: { status: AckStatus.fail } };
    }
    const workflowDefinition = this.#workflowDefinitions[flow.name];
    if (!workflowDefinition) {
      return {
        errors: [`${flow.name}: no workflow definition found for this workflowtype`],
        ack: { status: AckStatus.fail }
      };
    }
    const vpRequest = flow?.vpRequests ? flow.vpRequests[0] : undefined;
    if (!vpRequest) {
      return { errors: [`${flowId}: no vp-request associated this flowId`], ack: { status: AckStatus.fail } };
    }
    const result = await this.vcApiService.verifyPresentation(verifiablePresentation, {
      challenge: vpRequest.challenge
    });
    if (!result.checks.includes('proof')) {
      return {
        errors: [`${flowId}: verification of presentation proof not successful`],
        ack: { status: AckStatus.fail }
      };
    }
    return {
      errors: [],
      ack: { status: AckStatus.ok }
    };
  }

  public async getWorkflowDetails(flowId: string) {
    const getWorkflowResult = await this.getWorkflow(flowId);
    if (getWorkflowResult.errors.length > 0) {
      return { errors: getWorkflowResult.errors };
    }
    return {
      errors: [],
      workflowDetails: {
        name: getWorkflowResult.flow.name
      }
    };
  }

  private async getWorkflow(flowId: string): Promise<{ errors: string[]; flow?: ActiveFlowEntity }> {
    const flow = await this.activeFlowRepository.findOne(flowId, { relations: ['vpRequests'] });
    if (!flow) {
      return { errors: [`${flowId}: no workflow found for this flowId`] };
    }
    return { errors: [], flow };
  }
}
