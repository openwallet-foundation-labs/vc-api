import { IssuanceExchangeDefinition as IssuanceExchangeDefinition } from '../types/issuance-exchange-definition';
import { CredentialDto } from 'src/vc-api/dtos/credential.dto';
import { VcApiService } from 'src/vc-api/vc-api.service';
import { IssueOptionsDto } from '../../vc-api/dtos/issue-options.dto';
import { VerifiablePresentationDto } from '../../vc-api/dtos/verifiable-presentation.dto';
import { ExchangeResponseDto } from '../../vc-api/exchanges/dtos/exchange-response.dto';
import { DIDService } from 'src/did/did.service';
import { Presentation } from 'src/vc-api/exchanges/types/presentation';

export class ResidentCardIssuanceExchange implements IssuanceExchangeDefinition {
  #vcApiService: VcApiService;
  #didService: DIDService;

  constructor(vcApiService: VcApiService, didService: DIDService) {
    this.#vcApiService = vcApiService;
    this.#didService = didService;
  }

  handlePresentation: (vp: VerifiablePresentationDto) => Promise<ExchangeResponseDto> = async (
    vp: VerifiablePresentationDto
  ): Promise<ExchangeResponseDto> => {
    if (!vp.holder) {
      return { errors: ['holder of vp not provided'] };
    }
    const issuingDID = await this.#didService.generateKeyDID();
    const credential = this.fillCredential(issuingDID.id, vp.holder);
    const verificationMethodURI = issuingDID?.verificationMethod[0]?.id;
    if (!verificationMethodURI) {
      return { errors: ['verification method for issuance not available'] };
    }
    const options: IssueOptionsDto = {
      verificationMethod: verificationMethodURI
    };
    const vc = await this.#vcApiService.issueCredential({ credential, options });
    const presentation: Presentation = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      verifiableCredential: [vc]
    };
    const returnVp = await this.#vcApiService.provePresentation({ presentation, options });
    return {
      errors: [],
      vp: returnVp
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
