import { Test, TestingModule } from '@nestjs/testing';
import { EliaWorkflowController } from './elia-workflow.controller';
import { EliaWorkflowService } from './elia-workflow.service';

describe('EliaWorkflowController', () => {
  let controller: EliaWorkflowController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EliaWorkflowController],
      providers: [
        {
          provide: EliaWorkflowService,
          useValue: {}
        }
      ]
    }).compile();

    controller = module.get<EliaWorkflowController>(EliaWorkflowController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
