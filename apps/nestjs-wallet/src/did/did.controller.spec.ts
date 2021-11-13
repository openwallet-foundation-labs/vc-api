import { Methods } from '@ew-did-registry/did';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmSQLiteModule } from '../in-memory-db';
import { KeyModule } from '../key/key.module';
import { DIDController } from './did.controller';
import { DIDService } from './did.service';

describe('DidController', () => {
  let controller: DIDController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [KeyModule, ...TypeOrmSQLiteModule()],
      controllers: [DIDController],
      providers: [DIDService]
    }).compile();

    controller = module.get<DIDController>(DIDController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an ethr DID', async () => {
      const did = await controller.create(Methods.Erc1056, {});
    });
  });
});
