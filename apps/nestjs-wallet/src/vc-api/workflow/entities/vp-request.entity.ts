import { Column, Entity, ManyToOne } from 'typeorm';
import { VpRequestQueryType } from '../types/vp-request-query-type';
import { ActiveFlowEntity } from './active-flow.entity';

/**
 * A TypeOrm entity representing a VP Request
 * Should conform to https://w3c-ccg.github.io/vp-request-spec
 */
@Entity()
export class VpRequestEntity {
  /**
   * From https://w3c-ccg.github.io/vp-request-spec/#format :
   * "Challenge that will be digitally signed in the authentication proof
   *  that will be attached to the VerifiablePresentation response"
   */
  @Column('text', { primary: true })
  challenge: string;

  /**
   * From https://w3c-ccg.github.io/vp-request-spec/#format :
   * "To make a request for one or more objects wrapped in a Verifiable Presentation,
   *  a client constructs a JSON request describing one or more queries that it wishes to perform from the receiver."
   * "The query type serves as the main extension point mechanism for requests for data in the presentation.
   *  This document defines several common query types."
   */
  @Column('simple-json')
  query: { type: VpRequestQueryType; credentialQuery: any }[];

  /**
   * The schema for this property is taken from https://github.com/w3c-ccg/vc-api/issues/245
   * Probably makes sense for property to be optional until it is mentioned in the vp-request-spec:
   * https://github.com/w3c-ccg/vp-request-spec/pull/13/
   */
  @Column('simple-json')
  interact?: { service: { type: string; serviceEndpoint: string }[] };

  /**
   * Assumes that each VP Request is a part of an "Active Flow"
   * From https://github.com/w3c-ccg/vc-api/issues/245 :
   * "The ID on the end is bound to this particular request" (on the the of the interact.serviceEndpoints)
   */
  @ManyToOne((type) => ActiveFlowEntity, (activeFlow) => activeFlow.vpRequests)
  activeFlow: ActiveFlowEntity;
}
