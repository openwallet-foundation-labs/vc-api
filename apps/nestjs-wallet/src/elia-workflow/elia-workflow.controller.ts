import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VerifiablePresentationDto } from '../vc-api/dtos/verifiable-presentation.dto';
import { WorkflowResponseDto } from '../vc-api/workflow/dtos/workflow-response.dto';
import { EliaWorkflowService } from './elia-workflow.service';

@ApiTags('elia-workflow')
@Controller('elia-workflow')
export class EliaWorkflowController {
  constructor(private eliaWorkflowService: EliaWorkflowService) {}

  @Post('/workflows/:workflowname/start')
  startWorkflow(@Param('workflowname') workflowName: string): Promise<WorkflowResponseDto> {
    return this.eliaWorkflowService.startWorkflow(workflowName);
  }

  @Post('/workflows/:flowid/presentations')
  async submitPresentation(
    @Param('flowid') flowId: string,
    @Body() presentation: VerifiablePresentationDto
  ): Promise<WorkflowResponseDto> {
    return this.eliaWorkflowService.handlePresentation(flowId, presentation);
  }
}
