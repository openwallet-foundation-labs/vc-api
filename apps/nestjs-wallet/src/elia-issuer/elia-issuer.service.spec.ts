import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VcApiService } from '../vc-api/vc-api.service';
import { VerifiablePresentationDto } from '../vc-api/dto/verifiable-presentation.dto';
import { TypeOrmSQLiteModule } from '../in-memory-db';
import { EliaIssuerService } from './elia-issuer.service';
import { ActiveFlowEntity } from './entities/active-flow.entity';
import { VpRequestEntity } from './entities/vp-request.entity';
import { WorkflowType } from './types/workflow-type';

describe('IssuerEliaService', () => {
  let service: EliaIssuerService;
  let activeFlowRepository: Repository<ActiveFlowEntity>;

  // https://github.com/w3c-ccg/vc-api/issues/245
  const issuerUrl = 'http://issuer-corp.com/workflows/permanent-resident-card';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmSQLiteModule(), TypeOrmModule.forFeature([VpRequestEntity, ActiveFlowEntity])],
      providers: [
        EliaIssuerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => {
              return issuerUrl;
            })
          }
        },
        {
          provide: VcApiService,
          useValue: {
            verifyPresentation: jest.fn(() => true)
          }
        }
      ]
    }).compile();

    service = module.get<EliaIssuerService>(EliaIssuerService);
    activeFlowRepository = module.get<Repository<ActiveFlowEntity>>(getRepositoryToken(ActiveFlowEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * Chosing this as it is a simple standard credential which is compiled in Spruce ssi lib by default
   * https://github.com/spruceid/ssi/blob/main/contexts/w3c-2018-credentials-examples-v1.jsonld
   * https://w3c-ccg.github.io/citizenship-vocab/#example-1
   */
  it('should return an offer for PermanentResidentCard', () => {
    expect(service.getCredentialOffer().typeAvailable).toEqual('PermanentResidentCard');
    expect(service.getCredentialOffer().vcRequestUrl).toEqual(
      `${issuerUrl}/elia-issuer/start-workflow/permanent-resident-card`
    );
  });

  describe('startWorkflow', () => {
    it('should start Active Flow and return a VP Request', async () => {
      // UUID Regex: https://stackoverflow.com/a/6640851
      const uuidRegex = new RegExp('[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}');

      const { vpRequest } = await service.startWorkflow(WorkflowType.permanent_resident_card);
      expect(vpRequest.challenge).toMatch(uuidRegex);
      expect(vpRequest.interact.service.length).toBe(1);
      const activeFlowID = vpRequest.interact.service[0].serviceEndpoint.split('/').pop();
      const activeFlow = await activeFlowRepository.findOne(activeFlowID, { relations: ['vpRequests'] });
      expect(activeFlow.id).toMatch(uuidRegex);
      expect(activeFlow.vpRequests.length).toBe(1);
      expect(activeFlow.vpRequests[0].challenge).toEqual(vpRequest.challenge);
    });
  });

  describe('continueWorkflow', () => {
    it('should throw error if challenge has not been generated by issuer', async () => {
      await expect(
        service.continueWorkflow(new VerifiablePresentationDto(), 'not-a-persisted-challenge')
      ).rejects.toThrow();
    });

    it('should return credential if presentation is verified', async () => {
      const { vpRequest } = await service.startWorkflow(WorkflowType.permanent_resident_card);
      const credential = await service.continueWorkflow(new VerifiablePresentationDto(), vpRequest.challenge);
      expect(credential).toBeDefined();
    });
  });
});