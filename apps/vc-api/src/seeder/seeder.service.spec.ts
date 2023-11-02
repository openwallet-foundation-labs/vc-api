/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { SeederService } from './seeder.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { KeyPair } from '../key/key-pair.entity';
import { keyPairFixture } from './fixtures/key-pair.fixture';
import { DIDService } from '../did/did.service';

describe('SeederService', () => {
  let service: SeederService;

  const mockKeyPairRepository = { save: jest.fn() };
  const mockDIDService = { registerKeyDID: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeederService,
        { provide: getRepositoryToken(KeyPair), useValue: mockKeyPairRepository },
        {
          provide: DIDService,
          useValue: mockDIDService
        }
      ]
    }).compile();

    service = module.get<SeederService>(SeederService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seed()', function () {
    it('should be defined', async function () {
      expect(service.seed).toBeDefined();
    });

    describe('when called', function () {
      let exception: Error;

      beforeEach(async function () {
        mockKeyPairRepository.save.mockReset();
        mockDIDService.registerKeyDID.mockReset();
        try {
          await service.seed();
        } catch (err) {
          exception = err;
        }
      });

      it('should execute with no error thrown', async function () {
        expect(exception).not.toBeDefined();
      });

      it('should seed all key pairs', async function () {
        expect(mockKeyPairRepository.save).toHaveBeenCalledTimes(keyPairFixture.length);

        for (const keyPair of keyPairFixture) {
          expect(mockKeyPairRepository.save).toHaveBeenCalledWith(keyPair);
        }
      });

      it('should register DIDs', async function () {
        expect(mockDIDService.registerKeyDID).toHaveBeenCalledTimes(keyPairFixture.length);

        for (const keyPair of keyPairFixture) {
          expect(mockDIDService.registerKeyDID).toHaveBeenCalledWith(keyPair.publicKeyThumbprint);
        }
      });
    });
  });
});
