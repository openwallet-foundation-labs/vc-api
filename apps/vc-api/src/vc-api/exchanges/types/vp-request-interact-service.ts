import { VpRequestInteractServiceType } from './vp-request-interact-service-type';

export interface VpRequestInteractService {
  type: VpRequestInteractServiceType;
  serviceEndpoint: string;
}
