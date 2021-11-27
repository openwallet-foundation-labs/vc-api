import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { EliaIssuerController } from './elia-issuer.controller';
import { EliaIssuerService } from './elia-issuer.service';

describe('EliaIssuerController', () => {
  let controller: EliaIssuerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [EliaIssuerController],
      providers: [
        {
          provide: EliaIssuerService,
          useValue: {}
        }
      ]
    }).compile();

    controller = module.get<EliaIssuerController>(EliaIssuerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
