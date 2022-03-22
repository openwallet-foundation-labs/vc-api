import { validate } from 'class-validator';
import 'reflect-metadata';
import { RebeamCpoNode } from '../../../../test/vc-api/exchanges/rebeam/rebeam-cpo-node';
import { ResidentCardIssuance } from '../../../../test/vc-api/exchanges/resident-card/resident-card-issuance.exchange';
import { ResidentCardPresentation } from '../../../../test/vc-api/exchanges/resident-card/resident-card-presentation.exchange';

describe('ExchangeDefinition', () => {
  describe('Rebeam Presentation', () => {
    it('should be a valid exchange definition', async () => {
      const callback = 'https://example.com/endpoint';
      const exchange = new RebeamCpoNode(callback);
      const definition = exchange.getExchangeDefinition();
      const result = await validate(definition);
      expect(result).toHaveLength(0);
    });
  });
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
