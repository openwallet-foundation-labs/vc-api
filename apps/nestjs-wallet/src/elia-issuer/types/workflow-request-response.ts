import { VpRequestEntity } from '../entities/vp-request.entity';

/**
 * Describes the possible contents of response to a start/continue workflow request
 */
export interface WorkflowRequestResponse {
  vpRequest?: VpRequestEntity;
}
