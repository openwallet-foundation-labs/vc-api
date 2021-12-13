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
import { WorkflowResponseDto } from './dtos/workflow-response.dto';
import { WorkflowType } from './types/workflow-type';
import { CredentialDto } from 'src/vc-api/dto/credential.dto';
import { IssueOptionsDto } from 'src/vc-api/dto/issue-options.dto';

/**
 * A DID and verification method pair to use for proof generation
 * It is assumed that:
 * - The issuance service has access to the verification method
 * - The verification method has the correct relationship to the DID (TODO: add link to DID spec relationships)
 */
export interface IssuingDID {
  DID: string;
  verificationMethodURI: string;
}

@Injectable()
export class EliaIssuerService {
  /**
   * The DID to be used for proof generation
   * TODO: Figure out how to best set this. Maybe should be set by config? Maybe use "DID Label" or "DID Purpose" features?
   */
  public issuingDID: IssuingDID;

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
   * @returns workflow response
   */
  public async startWorkflow(workflowType: WorkflowType): Promise<WorkflowResponseDto> {
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
    return { errors: [], vpRequest };
  }

  /**
   * Continue an in-progress workflow.
   * TODO: add logging of errors (using structured logs?)
   * @param verifiablePresentation
   * @param flowId
   * @returns workflow response
   */
  public async continueWorkflow(
    verifiablePresentation: VerifiablePresentationDto,
    flowId: string
  ): Promise<WorkflowResponseDto> {
    const flow = await this.activeFlowRepository.findOne(flowId, { relations: ['vpRequests'] });
    if (!flow) {
      return { errors: [`${flowId}: no workflow found for this flowId`] };
    }
    const vpRequest = flow?.vpRequests ? flow.vpRequests[0] : undefined;
    if (!vpRequest) {
      return { errors: [`${flowId}: no vp-request associated this flowId`] };
    }
    const result = await this.vcApiService.verifyPresentation(verifiablePresentation, {
      challenge: vpRequest.challenge
    });
    if (!result.checks.includes('proof')) {
      return { errors: [`${flowId}: verification of presentation proof not successful`] };
    }
    const credential = this.fillCredential();
    if (!this.issuingDID?.verificationMethodURI) {
      return { errors: ['verification method for issuance not set'] };
    }
    const options: IssueOptionsDto = {
      verificationMethod: this.issuingDID.verificationMethodURI
    };
    const vc = await this.vcApiService.issueCredential({ credential, options });
    return {
      errors: [],
      vc
    };
  }

  private fillCredential(): CredentialDto {
    if (!this.issuingDID) {
      throw new Error('issuing DID not set');
    }
    // This hard-coded example is from https://w3c-ccg.github.io/citizenship-vocab/#example
    return {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://w3id.org/citizenship/v1'
        // optional country-specific context can be added below
        // e.g., https://uscis.gov/prc/v1
      ],
      id: 'https://issuer.oidp.uscis.gov/credentials/83627465',
      type: ['VerifiableCredential', 'PermanentResidentCard'],
      issuer: this.issuingDID.DID,
      issuanceDate: '2019-12-03T12:19:52Z',
      expirationDate: '2029-12-03T12:19:52Z',
      credentialSubject: {
        id: 'did:example:b34ca6cd37bbf23',
        type: ['PermanentResident', 'Person'],
        givenName: 'JOHN',
        familyName: 'SMITH',
        gender: 'Male',
        image: 'data:image/png;base64,iVBORw0KGgo...kJggg==',
        residentSince: '2015-01-01',
        lprCategory: 'C09',
        lprNumber: '999-999-999',
        commuterClassification: 'C1',
        birthCountry: 'Bahamas',
        birthDate: '1958-07-17'
      }
    };
  }
}
