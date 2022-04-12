import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { WalletClient } from './wallet-client';
import { didSuite } from './did/did.e2e-suite';
import { residentCardExchangeSuite } from './vc-api/exchanges/resident-card/resident-card.e2e-suite';
import { VpRequestDto } from '../src/vc-api/exchanges/dtos/vp-request.dto';
import { rebeamExchangeSuite } from './vc-api/exchanges/rebeam/rebeam.e2e-suite';
import { vcApiSuite } from './vc-api/credentials/vc-api.e2e-suite';

// Increasing timeout for debugging
// Should only affect this file https://jestjs.io/docs/jest-object#jestsettimeouttimeout
jest.setTimeout(300 * 1000);

export let app: INestApplication;
export let walletClient: WalletClient;
export const vcApiBaseUrl = '/vc-api';

describe('App (e2e)', () => {
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe()); // https://github.com/nestjs/nest/issues/5264
    await app.init();
    walletClient = new WalletClient(app);
  });

  describe('DID (e2e)', didSuite);
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
    /https?:\/\/[^\/]+/i,
    ''
  );
  return exchangeContinuationEndpoint;
}
