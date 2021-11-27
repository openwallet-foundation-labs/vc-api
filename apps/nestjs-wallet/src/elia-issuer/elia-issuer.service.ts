import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { VcApiService } from '../vc-api/vc-api.service';
import { CredentialOfferDto } from './dtos/credential-offer.dto';
import { VpRequestEntity } from './entities/vp-request.entity';
import { VerifiablePresentationDto } from '../vc-api/dto/verifiable-presentation.dto';
import { ActiveFlowEntity } from './entities/active-flow.entity';
import { WorkflowRequestResponse } from './types/workflow-request-response';
import { WorkflowType } from './types/workflow-type';

@Injectable()
export class EliaIssuerService {
  constructor(
    private configService: ConfigService,
    private vcApiService: VcApiService,
    @InjectRepository(VpRequestEntity)
    private vpRequestRepository: Repository<VpRequestEntity>,
    @InjectRepository(ActiveFlowEntity)
    private activeFlowRepository: Repository<ActiveFlowEntity>
  ) {}

  public getCredentialOffer(): CredentialOfferDto {
    const offer = new CredentialOfferDto();
    offer.typeAvailable = 'PermanentResidentCard';
    offer.vcRequestUrl = `${this.configService.get<string>('ISSUER_URL')}/elia-issuer/start-workflow/${
      WorkflowType.permanent_resident_card
    }`;
    return offer;
  }

  /**
   * Starts a workflow to obtain a credential
   * @param workflowType
   * @returns
   */
  public async startWorkflow(workflowType: WorkflowType): Promise<WorkflowRequestResponse> {
    const flowId = uuidv4();
    const challenge = uuidv4();
    const vpRequest = this.vpRequestRepository.create({
      challenge,
      query: [
        {
          // DIDAuth type defined here: https://w3c-ccg.github.io/vp-request-spec/#did-authentication-request
          type: 'DIDAuth'
        }
      ],
      // "interact" property of VpRequest is proposed here: https://github.com/w3c-ccg/vc-api/issues/245
      interact: {
        service: [
          {
            type: 'VcApiPresentationService2021',
            serviceEndpoint: `${this.configService.get<string>(
              'ISSUER_URL'
            )}/elia-issuer/active-flows/${flowId}`
          }
        ]
      }
    });
    const activeFlow = this.activeFlowRepository.create({
      id: flowId,
      vpRequests: [vpRequest]
    });
    await this.activeFlowRepository.save(activeFlow);
    return { vpRequest };
  }

  public async continueWorkflow(verifiablePresentation: VerifiablePresentationDto, challenge: string) {
    await this.vpRequestRepository.findOneOrFail(challenge);
    const result = await this.vcApiService.verifyPresentation(verifiablePresentation, { challenge });

    return result;
  }
}
