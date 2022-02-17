import { Column, Entity, OneToMany } from 'typeorm';
import { VpRequestEntity } from './vp-request.entity';

/**
 * A TypeOrm entity representing an in-progress or completed exchange
 * https://w3c-ccg.github.io/vc-api/#exchange-examples
 *
 * Some discussion regarding the rational behind the names:
 * https://github.com/w3c-ccg/vc-api/pull/262#discussion_r805895143
 */
@Entity()
export class ExchangeExecutionEntity {
  /**
   * An id for the active flow.
   * uuid chosen so as to not make the flow id guessable
   */
  @Column('text', { primary: true })
  id: string;

  @Column('text')
  exchangeId: string;

  /**
   * As the active flow can be iterative, there could be many VP Requests sent in a single flow
   * VP Requests are defined here: https://w3c-ccg.github.io/vp-request-spec/
   */
  @OneToMany((type) => VpRequestEntity, (vpRequest) => vpRequest.activeFlow, {
    cascade: true
  })
  vpRequests: VpRequestEntity[];
}
