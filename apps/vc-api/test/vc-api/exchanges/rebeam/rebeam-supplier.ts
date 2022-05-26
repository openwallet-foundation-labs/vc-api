/**
 * Copyright 2021, 2022 Energy Web Foundation
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { DIDDocument } from 'did-resolver';
import { WalletClient } from '../../../wallet-client';
import { CredentialDto } from '../../../../src/vc-api/credentials/dtos/credential.dto';
import { Presentation } from '../../../../src/vc-api/exchanges/types/presentation';
import { ProvePresentationOptionsDto } from '../../../../src/vc-api/credentials/dtos/prove-presentation-options.dto';

export class RebeamSupplier {
  /**
   * Issue credential to holder
   */
  async issueCredential(holderDidDoc: DIDDocument, walletClient: WalletClient) {
    const issuingDID = await walletClient.createDID('key');
    const credential = this.fillCredential(issuingDID.id, holderDidDoc.id);
    const issueCredentialDto = {
      options: {},
      credential
    };
    const vc = await walletClient.issueVC(issueCredentialDto);
    const presentation: Presentation = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      verifiableCredential: [vc]
    };
    const verificationMethodURI = issuingDID?.verificationMethod[0]?.id;
    if (!verificationMethodURI) {
      return { errors: ['verification method for issuance not available'] };
    }
    const presentationOptions: ProvePresentationOptionsDto = {
      verificationMethod: verificationMethodURI
    };
    const provePresentationDto = {
      options: presentationOptions,
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
          EWFRole: 'ew:EWFRole',
          key: 'ew:key',
          value: 'ew:value'
        }
      ],
      id: 'urn:uuid:7f94d397-3e70-4a43-945e-1a13069e636f',
      type: ['VerifiableCredential', 'EWFRole'],
      credentialSubject: {
        id: holderDID,
        issuerFields: [
          {
            key: 'accountId',
            value: 'energycustomerid1'
          }
        ],
        role: {
          namespace: 'customer.roles.rebeam.apps.eliagroup.iam.ewc',
          version: '1'
        }
      },
      issuer: issuerDID,
      issuanceDate: '2022-03-18T08:57:32.477Z'
    };
  }
}
