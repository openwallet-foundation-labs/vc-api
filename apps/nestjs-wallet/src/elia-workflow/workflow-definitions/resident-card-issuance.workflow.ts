import { IssuanceWorkflowDefinition } from '../types/issuance-workflow-definition';
import { CredentialDto } from 'src/vc-api/dtos/credential.dto';
import { VcApiService } from 'src/vc-api/vc-api.service';
import { AckStatus } from '../../vc-api/workflow/types/ack-status';
import { IssueOptionsDto } from '../../vc-api/dtos/issue-options.dto';
import { VerifiablePresentationDto } from '../../vc-api/dtos/verifiable-presentation.dto';
import { WorkflowResponseDto } from '../../vc-api/workflow/dtos/workflow-response.dto';
import { DIDService } from 'src/did/did.service';

export class ResidentCardIssuanceWorkflow implements IssuanceWorkflowDefinition {
  #vcApiService: VcApiService;
  #didService: DIDService;

  constructor(vcApiService: VcApiService, didService: DIDService) {
    this.#vcApiService = vcApiService;
    this.#didService = didService;
  }

  handlePresentation: (vp: VerifiablePresentationDto) => Promise<WorkflowResponseDto> = async (
    vp: VerifiablePresentationDto
  ): Promise<WorkflowResponseDto> => {
    if (!vp.holder) {
      return { errors: ['holder of vp not provided'], ack: { status: AckStatus.fail } };
    }
    const issuingDID = await this.#didService.generateKeyDID();
    const credential = this.fillCredential(issuingDID.id, vp.holder);
    const verificationMethodURI = issuingDID?.verificationMethod[0]?.id;
    if (!verificationMethodURI) {
      return { errors: ['verification method for issuance not available'], ack: { status: AckStatus.fail } };
    }
    const options: IssueOptionsDto = {
      verificationMethod: verificationMethodURI
    };
    const vc = await this.#vcApiService.issueCredential({ credential, options });
    return {
      errors: [],
      vc,
      ack: { status: AckStatus.ok }
    };
  };

  private fillCredential(issuingDID: string, holderDID: string): CredentialDto {
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
      issuer: issuingDID,
      issuanceDate: '2019-12-03T12:19:52Z',
      expirationDate: '2029-12-03T12:19:52Z',
      credentialSubject: {
        id: holderDID,
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

/**
 * A DID and verification method pair to use for proof generation
 * It is assumed that:
 * - The issuance service has access to the verification method
 * - The verification method has the correct relationship to the DID (TODO: add link to DID spec relationships)
 */
interface IssuingDID {
  DID: string;
  verificationMethodURI: string;
}
