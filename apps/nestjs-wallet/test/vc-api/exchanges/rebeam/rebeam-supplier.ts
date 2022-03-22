import { WalletClient } from '../../../wallet-client';
import { CredentialDto } from '../../../../src/vc-api/credentials/dtos/credential.dto';
import { Presentation } from '../../../../src/vc-api/exchanges/types/presentation';
import { DIDDocument } from 'did-resolver';

export class RebeamSupplier {
  /**
   *
   * TODO: get and approve presentation review
   * @param vp
   * @param walletClient
   * @returns
   */
  async issueCredential(holderDidDoc: DIDDocument, walletClient: WalletClient) {
    const issuingDID = await walletClient.createDID('key');
    const credential = this.fillCredential(issuingDID.id, holderDidDoc.id);
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

  private fillCredential(issuerDID: string, holderDID: string): CredentialDto {
    return {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        {
          issuerFields: {
            '@id': 'ew:issuerFields',
            '@type': 'ew:IssuerFields'
          },
          namespace: 'ew:namespace',
          role: {
            '@id': 'ew:role',
            '@type': 'ew:Role'
          },
          ew: 'https://energyweb.org/ld-context-2022#',
          version: 'ew:version',
          EWFRole: 'ew:EWFRole'
        }
      ],
      id: 'urn:uuid:7f94d397-3e70-4a43-945e-1a13069e636f',
      type: ['VerifiableCredential', 'EWFRole'],
      credentialSubject: {
        id: holderDID,
        issuerFields: [],
        role: {
          namespace: 'test.iam.ewc',
          version: '1'
        }
      },
      issuer: issuerDID,
      issuanceDate: '2022-03-18T08:57:32.477Z'
    };
  }
}
