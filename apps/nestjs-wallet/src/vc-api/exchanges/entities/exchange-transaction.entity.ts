import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { ExchangeExecutionEntity } from './exchange-execution.entity';
import { VpRequestEntity } from './vp-request.entity';

/**
 * A TypeOrm entity representing a single transaction in an exchange
 * https://w3c-ccg.github.io/vc-api/#exchange-examples
 *
 * Some discussion regarding the rational behind the names:
 * https://github.com/w3c-ccg/vc-api/pull/262#discussion_r805895143
 */
@Entity()
export class ExchangeTransactionEntity {
  /**
   * An id for the transaction
   */
  @Column('text', { primary: true })
  transactionId: string;

  /**
   * VP Requests are defined here: https://w3c-ccg.github.io/vp-request-spec/
   */
  @OneToOne(() => VpRequestEntity)
  @JoinColumn()
  vpRequest: VpRequestEntity;

  /**
   * Assumes that each transaction is a part of an exchange execution
   * https://w3c-ccg.github.io/vc-api/#exchange-examples
   */
  @ManyToOne((type) => ExchangeExecutionEntity, (execution) => execution.transactions)
  execution: ExchangeExecutionEntity;
}
