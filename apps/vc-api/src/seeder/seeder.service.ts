import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KeyPair } from '../key/key-pair.entity';
import { Repository } from 'typeorm';
import { keyPairFixture } from './fixtures/key-pair.fixture';
import { DIDService } from '../did/did.service';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name, { timestamp: true });

  constructor(
    @InjectRepository(KeyPair) private readonly keyPairRepository: Repository<KeyPair>,
    private readonly didService: DIDService
  ) {}

  async seed() {
    this.logger.debug('seeding database');

    for (const keyPair of keyPairFixture) {
      await this.keyPairRepository.save(keyPair);
      await this.didService.registerKeyDID(keyPair.publicKeyThumbprint);
    }

    this.logger.debug('seeding database complete');
  }
}
