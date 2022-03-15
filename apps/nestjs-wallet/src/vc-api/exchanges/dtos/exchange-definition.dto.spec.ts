import { validate } from 'class-validator';
import 'reflect-metadata';
import { ResidentCardIssuance } from '../../../../test/sample-business-logic/resident-card-issuance.exchange';
import { ResidentCardPresentation } from '../../../../test/sample-business-logic/resident-card-presentation.exchange';

describe('ExchangeDefinition', () => {
  describe('Resident Card Presentation', () => {
    it('should be a valid exchange definition', async () => {
      const callback = 'https://example.com/endpoint';
      const exchange = new ResidentCardPresentation(callback);
      const definition = exchange.getExchangeDefinition();
      const result = await validate(definition);
      expect(result).toHaveLength(0);
    });
  });
  describe('Resident Card Issuance', () => {
    it('should be a valid exchange definition', async () => {
      const exchange = new ResidentCardIssuance();
      const definition = exchange.getExchangeDefinition();
      const result = await validate(definition);
      expect(result).toHaveLength(0);
    });
  });
});
