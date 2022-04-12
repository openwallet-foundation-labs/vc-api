import { Column, Entity } from 'typeorm';
import { VpRequestInteractService } from '../types/vp-request-interact-service';
import { VpRequestQuery } from '../types/vp-request-query';

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

  @Column('simple-json')
  query: VpRequestQuery[];

  /**
   * The schema for this property is taken from https://github.com/w3c-ccg/vc-api/issues/245
   */
  @Column('simple-json')
  interact: { service: VpRequestInteractService[] };
}
