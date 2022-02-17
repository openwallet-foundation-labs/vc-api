import { IsArray, IsEnum } from 'class-validator';
import { VpRequestQueryType } from '../types/vp-request-query-type';

/**
 * https://w3c-ccg.github.io/vp-request-spec/#query-types
 */
export class VpRequestQueryDto {
  @IsEnum(VpRequestQueryType)
  type: VpRequestQueryType;

  /**
   * TODO: Validate the queries. Maybe with a custom validator E.g. this.#pex.validateDefinition(workflowDefinition.presentationDefinition);
   */
  @IsArray()
  credentialQuery: any[];
}
