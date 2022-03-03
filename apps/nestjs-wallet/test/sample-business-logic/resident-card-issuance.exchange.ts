import { WalletClient } from '../wallet-client';
import { VerifiablePresentationDto } from '../../src/vc-api/dtos/verifiable-presentation.dto';
import { CredentialDto } from '../../src/vc-api/dtos/credential.dto';
import { Presentation } from '../../src/vc-api/exchanges/types/presentation';

/**
 *
 * TODO: get and approve presentation review
 * @param vp
 * @param vcApiApp
 * @returns
 */
export async function issueCredential(vp: VerifiablePresentationDto, walletClient: WalletClient) {
  if (!vp.holder) {
    return { errors: ['holder of vp not provided'] };
  }
  const issuingDID = await walletClient.createDID('key');
  const credential = fillCredential(issuingDID.id, vp.holder);
  const verificationMethodURI = issuingDID?.verificationMethod[0]?.id;
  if (!verificationMethodURI) {
    return { errors: ['verification method for issuance not available'] };
  }
  const options = {
    verificationMethod: verificationMethodURI
  };
  const issueCredentialDto = {
    options,
    credential
  };
  const vc = await walletClient.issueVC(issueCredentialDto);
  const presentation: Presentation = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiablePresentation'],
    verifiableCredential: [vc]
  };
  const provePresentationDto = {
    options,
    presentation
  };
  const returnVp = await walletClient.provePresentation(provePresentationDto);
  return {
    errors: [],
    vp: returnVp
  };
}

function fillCredential(issuingDID: string, holderDID: string): CredentialDto {
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
