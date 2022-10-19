import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KeyPair } from '../key/key-pair.entity';
import { Repository } from 'typeorm';
import { keyPairFixture } from './fixtures/key-pair.fixture';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name, { timestamp: true });

  constructor(@InjectRepository(KeyPair) private readonly keyPairRepository: Repository<KeyPair>) {}

  async seed() {
    this.logger.debug('seeding database');

    for (const keyPair of keyPairFixture) {
      await this.keyPairRepository.save(keyPair);
    }

    this.logger.debug('seeding database complete');
  }
}
