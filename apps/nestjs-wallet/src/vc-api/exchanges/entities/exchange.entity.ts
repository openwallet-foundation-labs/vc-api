import { Column, Entity } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { VpRequestQuery } from '../types/vp-request-query';
import { TransactionEntity } from './transaction.entity';
import { VpRequestInteractServiceDefinition } from '../types/vp-request-interact-service-definition';
import { VpRequestInteractServiceType } from '../types/vp-request-interact-service-type';
import { VpRequestEntity } from './vp-request.entity';

/**
 * A TypeOrm entity representing an exchange
 * https://w3c-ccg.github.io/vc-api/#exchange-examples
 *
 * Some discussion regarding the rational behind the names:
 * https://github.com/w3c-ccg/vc-api/pull/262#discussion_r805895143
 *
 * An exchange does not keep reference to its transactions
 * as the number of transactions grow quite high for a reusable exchange (e.g. "issue-degree" could issues thousands of degrees)
 */
@Entity()
export class ExchangeEntity {
  @Column('text', { primary: true })
  exchangeId: string;

  /**
   * Marks whether or not the exchange only be used once
   */
  @Column('boolean')
  isOneTime: boolean;

  @Column('simple-json')
  interactServiceDefinitions: VpRequestInteractServiceDefinition[];

  /**
   * From https://w3c-ccg.github.io/vp-request-spec/#format :
   * "To make a request for one or more objects wrapped in a Verifiable Presentation,
   *  a client constructs a JSON request describing one or more queries that it wishes to perform from the receiver."
   * "The query type serves as the main extension point mechanism for requests for data in the presentation."
   *
   * This property contains the queries that are to be instantiated in each transaction
   */
  @Column('simple-json')
  query: VpRequestQuery[];

  /**
   * Create transaction associated with this exchange.
   *
   * Transactions are created by exchange (exchange is the aggregate root) because the exchange may want to enforce invariants such as
   * "This exchange may only have a single transaction" (i.e. see isOneTime property)
   *
   * @param baseUrl The baseUrl to use for any interaction services
   * @returns
   */
  public start(baseUrl?: string): TransactionEntity {
    // Using the same transactionId as exchangeId for a one-time exchange.
    // Then, when trying to persist the transaction with the already started transactionId, the persistance will fail.
    const transactionId = this.isOneTime ? this.exchangeId : uuidv4();
    const challenge = uuidv4();
    const interactServices = this.interactServiceDefinitions.map((serviceDef) => {
      const serviceEndpoint = `${baseUrl}/exchanges/${this.exchangeId}/${transactionId}`;
      return {
        type: serviceDef.type,
        serviceEndpoint
      };
    });
    const vpRequest: VpRequestEntity = {
      challenge,
      // This duplication (query in exchange and query in transaction) so that info can be cross aggregate-root
      query: this.query,
      interact: {
        service: interactServices
      }
    };
    const transaction = new TransactionEntity(transactionId, this.exchangeId, vpRequest);
    return transaction;
  }
}
