import { Test, TestingModule } from '@nestjs/testing';
import { DidModule } from '../did/did.module';
import { TypeOrmSQLiteModule } from '../in-memory-db';
import { KeyModule } from '../key/key.module';
import { CredentialsController } from './credentials.controller';
import { CredentialsService } from './credentials.service';

describe('CredentialsController', () => {
  let controller: CredentialsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [KeyModule, DidModule, TypeOrmSQLiteModule()],
      controllers: [CredentialsController],
      providers: [CredentialsService]
    }).compile();

    controller = module.get<CredentialsController>(CredentialsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
