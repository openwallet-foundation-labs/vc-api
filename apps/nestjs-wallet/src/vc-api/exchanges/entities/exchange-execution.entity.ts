import { Column, Entity, OneToMany } from 'typeorm';
import { ExchangeTransactionEntity } from './exchange-transaction.entity';

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
   * An id for the exchange execution.
   * uuid chosen so as to not make the flow id guessable
   */
  @Column('text', { primary: true })
  executionId: string;

  @Column('text')
  exchangeId: string;

  /**
   * As the exchange can be iterative, there could be many transactions sent in a single flow
   */
  @OneToMany((type) => ExchangeTransactionEntity, (transaction) => transaction.execution, {
    cascade: true
  })
  transactions: ExchangeTransactionEntity[];
}
