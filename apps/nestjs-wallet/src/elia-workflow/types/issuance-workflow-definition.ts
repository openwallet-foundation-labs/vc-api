import { VerifiablePresentationDto } from '../../vc-api/dtos/verifiable-presentation.dto';
import { WorkflowResponseDto } from 'src/vc-api/workflow/dtos/workflow-response.dto';

/**
 * A workflow definition for credential issuance
 */
export interface IssuanceWorkflowDefinition {
  handlePresentation: (vp: VerifiablePresentationDto) => Promise<WorkflowResponseDto>;
}
