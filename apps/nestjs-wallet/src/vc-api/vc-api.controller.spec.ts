import { Test, TestingModule } from '@nestjs/testing';
import { DidModule } from '../did/did.module';
import { TypeOrmSQLiteModule } from '../in-memory-db';
import { KeyModule } from '../key/key.module';
import { VcApiController } from './vc-api.controller';
import { VcApiService } from './vc-api.service';

describe('VcApiController', () => {
  let controller: VcApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [KeyModule, DidModule, TypeOrmSQLiteModule()],
      controllers: [VcApiController],
      providers: [VcApiService]
    }).compile();

    controller = module.get<VcApiController>(VcApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
