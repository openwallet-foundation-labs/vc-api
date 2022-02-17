import { IsString, ValidateNested } from 'class-validator';
import { VpRequestQueryDto } from './vp-request-query.dto';
import { WorkflowInteractServiceDefinitionDto } from './workflow-interact-service-definition.dto';

/**
 * A workflow definition
 */
export class WorkflowDefinitionDto {
  @IsString()
  workflowName: string;

  @ValidateNested()
  interactServices: WorkflowInteractServiceDefinitionDto[];

  @ValidateNested({ each: true })
  query: VpRequestQueryDto[];
}
