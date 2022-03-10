import { VpRequestInteractServiceType } from '../types/vp-request-interact-service-type';
import { TransactionEntity } from './transaction.entity';
import { VpRequestEntity } from './vp-request.entity';

describe('TransactionEntity', () => {
  beforeEach(async () => {});

  afterEach(async () => {
    jest.resetAllMocks();
  });

  describe('processPresentation', () => {
    it('should return result upon successful verification of UnMediatedPresentation', async () => {
      const vp = {
        '@context': [],
        type: [],
        verifiableCredential: [],
        proof: {}
      };
      const vpRequest: VpRequestEntity = {
        challenge: 'a9511bdb-5577-4d2f-95e3-e819fe5d3c33',
        query: [],
        interact: {
          service: [
            {
              type: VpRequestInteractServiceType.unmediatedPresentation,
              serviceEndpoint: 'https://endpoint.com'
            }
          ]
        }
      };
      const callback_1 = 'https://my-callback.com';
      const configuredCallback = [{ url: callback_1 }];
      const exchangeId = 'my-exchange';
      const transactionId = '9ec5686e-6381-41c4-9286-3c93cdefac53';
      const transaction = new TransactionEntity(transactionId, exchangeId, vpRequest, configuredCallback);
      const { callback, response } = transaction.processPresentation(vp);
      expect(callback).toHaveLength(1);
      expect(callback[0].url).toEqual(callback_1);
      expect(response.errors).toHaveLength(0);
      expect(response.vpRequest).toBeUndefined();
      expect(response.vp).toBeUndefined();
    });
  });
});
