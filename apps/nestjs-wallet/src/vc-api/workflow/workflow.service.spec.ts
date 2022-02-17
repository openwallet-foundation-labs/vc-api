import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmSQLiteModule } from '../../in-memory-db';
import { Repository } from 'typeorm';
import { VcApiService } from '../vc-api.service';
import { ActiveFlowEntity } from './entities/active-flow.entity';
import { VpRequestEntity } from './entities/vp-request.entity';
import { WorkflowService } from './workflow.service';
import { WorkflowDefinitionDto } from './dtos/workflow-definition.dto';
import { VpRequestInteractServiceType } from './types/vp-request-interact-service-type';
import { VpRequestInteractDto } from './dtos/vp-request-interact.dto';

describe('WorkflowService', () => {
  let service: WorkflowService;
  let vcApiService: VcApiService;
  let activeFlowRepository: Repository<ActiveFlowEntity>;
  let vpRequestRepository: Repository<VpRequestEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmSQLiteModule(), TypeOrmModule.forFeature([VpRequestEntity, ActiveFlowEntity])],
      providers: [
        WorkflowService,
        {
          provide: VcApiService,
          useValue: {}
        }
      ]
    }).compile();

    vcApiService = module.get<VcApiService>(VcApiService);
    service = module.get<WorkflowService>(WorkflowService);
    activeFlowRepository = module.get<Repository<ActiveFlowEntity>>(getRepositoryToken(ActiveFlowEntity));
    vpRequestRepository = module.get<Repository<VpRequestEntity>>(getRepositoryToken(VpRequestEntity));
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startWorkflow', () => {
    it('should start workflow from a workflow definition', async () => {
      const workflowName = 'test-workflow';
      const baseUrl = 'https://test-issuer.com';
      const workflowDef: WorkflowDefinitionDto = {
        workflowName,
        interactServices: [
          {
            type: VpRequestInteractServiceType.unmediatedPresentation,
            baseUrl
          }
        ],
        query: []
      };
      service.configureWorkflow(workflowDef);
      const workflowResponse = await service.startWorkflow(workflowName);
      expect(workflowResponse.vpRequest.interact.service).toHaveLength(1);
      expect(workflowResponse.vpRequest.interact.service[0].serviceEndpoint).toContain(baseUrl);
    });
  });
});
