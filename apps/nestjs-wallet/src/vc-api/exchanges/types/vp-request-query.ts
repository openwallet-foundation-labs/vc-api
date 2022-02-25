import { VpRequestQueryType } from './vp-request-query-type';

/**
 * From https://w3c-ccg.github.io/vp-request-spec/#format :
 * "To make a request for one or more objects wrapped in a Verifiable Presentation,
 *  a client constructs a JSON request describing one or more queries that it wishes to perform from the receiver."
 * "The query type serves as the main extension point mechanism for requests for data in the presentation.
 *  This document defines several common query types."
 */
export interface VpRequestQuery {
  type: VpRequestQueryType;
  credentialQuery: any;
}
