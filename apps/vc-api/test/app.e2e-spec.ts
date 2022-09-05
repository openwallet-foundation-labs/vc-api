/**
 * Copyright 2021, 2022 Energy Web Foundation
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

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { WalletClient } from './wallet-client';
import { didSuite } from './did/did.e2e-suite';
import { residentCardExchangeSuite } from './vc-api/exchanges/resident-card/resident-card.e2e-suite';
import { VpRequestDto } from '../src/vc-api/exchanges/dtos/vp-request.dto';
import { rebeamExchangeSuite } from './vc-api/exchanges/rebeam/rebeam.e2e-suite';
import { vcApiSuite } from './vc-api/credentials/vc-api.e2e-suite';
import { keySuite } from './key/key.e2e-suite';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExchangeEntity } from '../src/vc-api/exchanges/entities/exchange.entity';
import { API_DEFAULT_VERSION, API_DEFAULT_VERSION_PREFIX } from '../src/setup';

// Increasing timeout for debugging
// Should only affect this file https://jestjs.io/docs/jest-object#jestsettimeouttimeout
jest.setTimeout(300 * 1000);

export let app: INestApplication;
export let walletClient: WalletClient;
export const vcApiBaseUrl = `${API_DEFAULT_VERSION_PREFIX}/vc-api`;

describe('App (e2e)', () => {
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe()); // https://github.com/nestjs/nest/issues/5264
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: [API_DEFAULT_VERSION]
    });
    await app.init();
    walletClient = new WalletClient(app);

    //TODO: reset the database fully
    const exchangeRepository = app.get(getRepositoryToken(ExchangeEntity));
    await exchangeRepository.clear();
  });

  describe('DID (e2e)', didSuite);
  describe('Key (e2e)', keySuite);
  describe('VC-API (e2e)', vcApiSuite);
  describe('Resident Card (e2e)', residentCardExchangeSuite);
  describe('Rebeam (e2e)', rebeamExchangeSuite);
});

/**
 * https://stackoverflow.com/a/2599721 , because only need path for test
 * @param vpRequest
 * @returns exchange continuation endpoint
 */
export function getContinuationEndpoint(vpRequest: VpRequestDto): string {
  const exchangeContinuationEndpoint = vpRequest.interact.service[0].serviceEndpoint.replace(
    /https?:\/\/[^/]+/i,
    ''
  );
  return exchangeContinuationEndpoint;
}
