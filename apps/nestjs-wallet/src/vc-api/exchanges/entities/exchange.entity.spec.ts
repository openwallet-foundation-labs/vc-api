import { ExchangeDefinitionDto } from '../dtos/exchange-definition.dto';
import { ExchangeEntity } from './exchange.entity';

describe('ExchangeEntity', () => {
  describe('start', () => {
    it('should respond with the same transaction id if it is a oneTime exchange', async () => {
      const exchangeDefinition: ExchangeDefinitionDto = {
        exchangeId: '9ec5686e-6381-41c4-9286-3c93cdefac53',
        interactServices: [],
        query: [],
        callback: [],
        isOneTime: true
      };
      const exchange = new ExchangeEntity(exchangeDefinition);
      const transaction_1 = exchange.start();
      const transaction_2 = exchange.start();
      expect(transaction_1.transactionId).toEqual(transaction_2.transactionId);
    });

    it('should respond with different transaction id if it is not a ontTime exchange', async () => {
      const exchangeDefinition: ExchangeDefinitionDto = {
        exchangeId: '9ec5686e-6381-41c4-9286-3c93cdefac53',
        interactServices: [],
        query: [],
        callback: [],
        isOneTime: false
      };
      const exchange = new ExchangeEntity(exchangeDefinition);
      const transaction_1 = exchange.start();
      const transaction_2 = exchange.start();
      expect(transaction_1.transactionId).not.toEqual(transaction_2.transactionId);
    });
  });
});
