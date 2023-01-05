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

import { validate } from 'class-validator';
import 'reflect-metadata';
import { RebeamCpoNode } from '../../../../test/vc-api/exchanges/rebeam/rebeam-cpo-node';
import { ResidentCardIssuance } from '../../../../test/vc-api/exchanges/resident-card/resident-card-issuance.exchange';
import { ResidentCardPresentation } from '../../../../test/vc-api/exchanges/resident-card/resident-card-presentation.exchange';

const callback = 'https://example.com/endpoint';

describe('ExchangeDefinition', () => {
  describe('Rebeam Presentation', () => {
    it('should be a valid exchange definition', async () => {
      const exchange = new RebeamCpoNode(callback);
      const definition = exchange.getExchangeDefinition();
      const result = await validate(definition);
      expect(result).toHaveLength(0);
    });
  });
  describe('Resident Card Presentation', () => {
    it('should be a valid exchange definition', async () => {
      const exchange = new ResidentCardPresentation(callback);
      const definition = exchange.getExchangeDefinition();
      const result = await validate(definition);
      expect(result).toHaveLength(0);
    });
  });
  describe('Resident Card Issuance', () => {
    it('should be a valid exchange definition', async () => {
      const exchange = new ResidentCardIssuance(callback);
      const definition = exchange.getExchangeDefinition();
      const result = await validate(definition);
      expect(result).toHaveLength(0);
    });
  });
});
