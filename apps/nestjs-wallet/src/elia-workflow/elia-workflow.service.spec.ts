import { Test, TestingModule } from '@nestjs/testing';
import { DIDService } from '../did/did.service';
import { VcApiService } from '../vc-api/vc-api.service';
import { WorkflowService } from '../vc-api/workflow/workflow.service';
import { EliaWorkflowService } from './elia-workflow.service';

describe('EliaWorkflowService', () => {
  let service: EliaWorkflowService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EliaWorkflowService,
        {
          provide: VcApiService,
          useValue: {}
        },
        {
          provide: WorkflowService,
          useValue: {}
        },
        {
          provide: DIDService,
          useValue: {}
        }
      ]
    }).compile();

    service = module.get<EliaWorkflowService>(EliaWorkflowService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
