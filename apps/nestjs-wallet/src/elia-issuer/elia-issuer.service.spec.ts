import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { VcApiService } from '../vc-api/vc-api.service';
import { VerifiablePresentationDto } from '../vc-api/dto/verifiable-presentation.dto';
import { TypeOrmSQLiteModule } from '../in-memory-db';
import { EliaIssuerService } from './elia-issuer.service';
import { ActiveFlowEntity } from './entities/active-flow.entity';
import { VpRequestEntity } from './entities/vp-request.entity';
import { WorkflowType } from './types/workflow-type';

describe('EliaIssuerService', () => {
  let service: EliaIssuerService;
  let vcApiService: VcApiService;
  let activeFlowRepository: Repository<ActiveFlowEntity>;
  let vpRequestRepository: Repository<VpRequestEntity>;

  const issuerUrl = 'http://issuer-corp.com';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmSQLiteModule(), TypeOrmModule.forFeature([VpRequestEntity, ActiveFlowEntity])],
      providers: [
        EliaIssuerService,
        VcApiService,
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
            verifyPresentation: jest.fn(),
            issueCredential: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<EliaIssuerService>(EliaIssuerService);
    service.issuingDID = {
      DID: 'did:example:123',
      verificationMethodURI: 'did:example:123#_Qq0UL2Fq651Q0Fjd6TvnYE-faHiOpRlPVQcY_-tA4A'
    };
    vcApiService = module.get<VcApiService>(VcApiService);
    activeFlowRepository = module.get<Repository<ActiveFlowEntity>>(getRepositoryToken(ActiveFlowEntity));
    vpRequestRepository = module.get<Repository<VpRequestEntity>>(getRepositoryToken(VpRequestEntity));
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCredentialOffer', () => {
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
    it('should return error if no flow for provided flowId', async () => {
      const response = await service.continueWorkflow(
        new VerifiablePresentationDto(),
        'not-a-persisted-flowId'
      );
      expect(response.errors).toHaveLength(1);
    });

    it('should return error if no vp-request associated with the flow', async () => {
      const challenge = uuidv4();
      jest.spyOn(activeFlowRepository, 'findOne').mockResolvedValueOnce({
        id: uuidv4(),
        vpRequests: []
      });
      const response = await service.continueWorkflow(new VerifiablePresentationDto(), challenge);
      expect(response.errors).toHaveLength(1);
    });

    it('should return error if presentation proof does not verify', async () => {
      const challenge = uuidv4();
      jest.spyOn(activeFlowRepository, 'findOne').mockResolvedValueOnce({
        id: uuidv4(),
        vpRequests: []
      });
      jest.spyOn(vcApiService, 'verifyPresentation').mockResolvedValueOnce({
        checks: [],
        errors: [],
        warnings: []
      });
      const response = await service.continueWorkflow(new VerifiablePresentationDto(), challenge);
      expect(response.errors).toHaveLength(1);
    });

    it('should return credential if presentation is verified', async () => {
      const challenge = uuidv4();
      jest.spyOn(activeFlowRepository, 'findOne').mockResolvedValueOnce({
        id: uuidv4(),
        vpRequests: [
          vpRequestRepository.create({
            challenge: challenge,
            query: []
          })
        ]
      });
      jest.spyOn(vcApiService, 'verifyPresentation').mockResolvedValueOnce({
        checks: ['proof'],
        errors: [],
        warnings: []
      });
      jest.spyOn(vcApiService, 'issueCredential').mockImplementationOnce(async (issueDto) => {
        return { ...issueDto.credential, ...{ proof: {} } }; // proof is empty but symbolizing a signed proof
      });
      const response = await service.continueWorkflow(new VerifiablePresentationDto(), challenge);
      expect(response.errors).toHaveLength(0);
      expect(response.vc).toBeDefined();
    });
  });
});
