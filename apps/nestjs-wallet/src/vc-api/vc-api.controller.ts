import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VcApiService } from './vc-api.service';
import { IssueCredentialDto } from './dtos/issue-credential.dto';
import { VerifiableCredentialDto } from './dtos/verifiable-credential.dto';
import { AuthenticateDto } from './dtos/authenticate.dto';
import { VerifiablePresentationDto } from './dtos/verifiable-presentation.dto';
import { WorkflowService } from './workflow/workflow.service';
import { WorkflowResponseDto } from './workflow/dtos/workflow-response.dto';
import { WorkflowDefinitionDto } from './workflow/dtos/workflow-definition.dto';

/**
 * VcApi API conforms to W3C vc-api
 * https://github.com/w3c-ccg/vc-api
 */
@ApiTags('vc-api')
@Controller('vc-api')
export class VcApiController {
  constructor(private vcApiService: VcApiService, private workflowService: WorkflowService) {}

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

  // WORKFLOW
  // https://w3c-ccg.github.io/vc-api/#workflows

  /**
   * TODO: Needs to have special authorization
   * Maybe better as config files?
   * @param workflowDefinitionDto
   * @returns
   */
  @Post('/workflows/configure')
  async configureWorkflow(@Body() workflowDefinitionDto: WorkflowDefinitionDto) {
    return this.workflowService.configureWorkflow(workflowDefinitionDto);
  }

  @Post('/workflows/:workflowname/start')
  startWorkflow(@Param('workflowname') workflowName: string): Promise<WorkflowResponseDto> {
    return this.workflowService.startWorkflow(workflowName);
  }

  @Post('/workflows/:flowid/presentations')
  async submitPresentation(
    @Param('flowid') flowId: string,
    @Body() presentation: VerifiablePresentationDto
  ): Promise<WorkflowResponseDto> {
    return await this.workflowService.handlePresentation(presentation, flowId);
  }

  /**
   * Issue a DIDAuth presentation that authenticates a DID.
   * Not technically a part of VC-API? Maybe there is a DID Auth spec though?
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
