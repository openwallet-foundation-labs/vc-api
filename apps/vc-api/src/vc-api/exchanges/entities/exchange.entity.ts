/**
 * Copyright 2021 - 2023 Energy Web Foundation
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Column, Entity } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { VpRequestQuery } from '../types/vp-request-query';
import { TransactionEntity } from './transaction.entity';
import { VpRequestInteractServiceDefinition } from '../types/vp-request-interact-service-definition';
import { VpRequestEntity } from './vp-request.entity';
import { CallbackConfiguration } from '../types/callback-configuration';
import { ExchangeDefinitionDto } from '../dtos/exchange-definition.dto';

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
  constructor(exchangeDefinitionDto: ExchangeDefinitionDto) {
    this.exchangeId = exchangeDefinitionDto?.exchangeId;
    this.interactServiceDefinitions = exchangeDefinitionDto?.interactServices;
    this.query = exchangeDefinitionDto?.query;
    this.callback = exchangeDefinitionDto?.callback;
    if (exchangeDefinitionDto?.isOneTime) {
      this.oneTimeTransactionId = uuidv4();
    }
  }

  @Column('text', { primary: true })
  exchangeId: string;

  /**
   * The transaction id to be used if the exchange is a "one time" exchange
   */
  @Column('text', { nullable: true })
  oneTimeTransactionId?: string;

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
   * Location where vc-api will notify exchange issuer/verifier of exchange result
   */
  @Column('simple-json')
  callback: CallbackConfiguration[];

  /**
   * Create transaction associated with this exchange.
   *
   * Transactions are created by exchange (exchange is the aggregate root) because the exchange may want to enforce invariants such as
   * "This exchange may only have a single transaction" (i.e. see oneTimeTransactionId property)
   *
   * @param baseUrl The baseUrl to use for any interaction services
   * @returns
   */
  public start(baseUrl?: string): TransactionEntity {
    // If exchange should only be used once, then return the pre-generated transactionId
    // Then, when trying to persist the transaction with the already started transactionId, the persistance will fail.
    const transactionId = this.oneTimeTransactionId ?? uuidv4();
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
    const transaction = new TransactionEntity(transactionId, this.exchangeId, vpRequest, this.callback);
    return transaction;
  }
}
