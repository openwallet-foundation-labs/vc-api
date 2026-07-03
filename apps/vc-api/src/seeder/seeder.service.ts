/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, Logger } from '@nestjs/common';
import { keyPairFixture } from './fixtures/key-pair.fixture';
import { DIDService } from '../did/did.service';
import { KeyService } from '../key/key.service';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name, { timestamp: true });

  constructor(
    private readonly keyService: KeyService,
    private readonly didService: DIDService
  ) {}

  async seed() {
    this.logger.debug('seeding database');

    for (const keyPair of keyPairFixture) {
      const key = await this.keyService.importKey(keyPair);
      const seededDid = await this.didService.registerKeyDID(key.keyId);
      this.logger.debug(`seeded ${seededDid?.id}`);
    }

    this.logger.debug('seeding database complete');
  }
}
