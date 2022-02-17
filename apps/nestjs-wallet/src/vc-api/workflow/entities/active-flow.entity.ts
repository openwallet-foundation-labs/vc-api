import { Column, Entity, OneToMany } from 'typeorm';
import { VpRequestEntity } from './vp-request.entity';

/**
 * A TypeOrm entity representing an Active Flow
 * An "active flow" is a loosely defined concept mentioned in this proposal: https://github.com/w3c-ccg/vc-api/issues/245
 * The idea seems to be that it can be used to tie together several requests in a flow
 */
@Entity()
export class ActiveFlowEntity {
  /**
   * An id for the active flow.
   * uuid chosen so as to not make the flow id guessable
   */
  @Column('text', { primary: true })
  id: string;

  @Column('text')
  name: string;

  /**
   * As the active flow can be iterative, there could be many VP Requests sent in a single flow
   * VP Requests are defined here: https://w3c-ccg.github.io/vp-request-spec/
   */
  @OneToMany((type) => VpRequestEntity, (vpRequest) => vpRequest.activeFlow, {
    cascade: true
  })
  vpRequests: VpRequestEntity[];
}
