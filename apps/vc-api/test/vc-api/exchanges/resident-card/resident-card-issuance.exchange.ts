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

import { plainToClass } from 'class-transformer';
import { WalletClient } from '../../../wallet-client';
import { VerifiablePresentationDto } from '../../../../src/vc-api/credentials/dtos/verifiable-presentation.dto';
import { CredentialDto } from '../../../../src/vc-api/credentials/dtos/credential.dto';
import { Presentation } from '../../../../src/vc-api/exchanges/types/presentation';
import { ExchangeDefinitionDto } from '../../../../src/vc-api/exchanges/dtos/exchange-definition.dto';
import { VpRequestInteractServiceType } from '../../../../src/vc-api/exchanges/types/vp-request-interact-service-type';
import { VpRequestQueryType } from '../../../../src/vc-api/exchanges/types/vp-request-query-type';
import { ProvePresentationOptionsDto } from '../../../../src/vc-api/credentials/dtos/prove-presentation-options.dto';

export class ResidentCardIssuance {
  #exchangeId = 'permanent-resident-card-issuance';
  queryType = VpRequestQueryType.didAuth;

  getExchangeId(): string {
    return this.#exchangeId;
  }

  getExchangeDefinition(): ExchangeDefinitionDto {
    const exchangeDefinition: ExchangeDefinitionDto = {
      exchangeId: this.#exchangeId,
      query: [
        {
          type: this.queryType,
          credentialQuery: []
        }
      ],
      interactServices: [
        {
          type: VpRequestInteractServiceType.mediatedPresentation
        }
      ],
      isOneTime: false,
      callback: []
    };
    return plainToClass(ExchangeDefinitionDto, exchangeDefinition);
  }

  /**
   *
   * TODO: get and approve presentation review
   * @param vp
   * @param walletClient
   * @returns
   */
  async issueCredential(vp: VerifiablePresentationDto, walletClient: WalletClient) {
    if (!vp.holder) {
      return { errors: ['holder of vp not provided'] };
    }
    const issuingDID = await walletClient.createDID('key');
    const credential = this.fillCredential(issuingDID.id, vp.holder);
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
