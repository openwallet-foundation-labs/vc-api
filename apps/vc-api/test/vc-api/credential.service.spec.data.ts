/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { Optionality, Rules } from '@sphereon/pex-models';
import { CredentialDto } from 'src/vc-api/credentials/dtos/credential.dto';
import { Presentation } from 'src/vc-api/exchanges/types/presentation';
import { VerifiableCredential } from 'src/vc-api/exchanges/types/verifiable-credential';
import { did } from './credential.service.spec.key';

export const presentationDefinition = {
  id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
  submission_requirements: [
    {
      name: 'Energy supplier custom contract',
      purpose: 'An energy supplier contract is needed for Rebeam authorization',
      rule: Rules.All,
      from: 'A'
    },
    {
      name: 'Data needs to be signed by the user',
      purpose: 'Data needs to be signed by the user to end the charging',
      rule: Rules.All,
      from: 'B'
    }
  ],
  input_descriptors: [
    {
      id: 'energy_supplier_customer_contract',
      name: 'Energy Supplier Customer Contract',
      group: ['A'],
      purpose: 'An energy supplier contract is needed for Rebeam authorization',
      constraints: {
        fields: [
          {
            path: ['$.credentialSubject.role.namespace'],
            filter: {
              type: 'string',
              const: 'customer.roles.rebeam.apps.eliagroup.iam.ewc'
            }
          },
          {
            path: ['$.credentialSubject.issuerFields[*].key'],
            filter: {
              type: 'string',
              const: 'accountId'
            }
          }
        ]
      }
    },
    {
      id: 'charging_data',
      name: 'Data needs to be signed by the user',
      group: ['B'],
      purpose: 'Data needs to be signed by the user to end the charging',
      constraints: {
        subject_is_issuer: Optionality.Required,
        fields: [
          {
            path: ['$.credentialSubject.chargingData.contractDID'],
            filter: {
              type: 'string',
              const: 'did:ethr:blxm-local:0x429eCb49aAC34E076f19D5C91d7e8B956AEf9c08'
            }
          },
          {
            path: ['$.credentialSubject.chargingData.evseId'],
            filter: {
              type: 'string',
              const: '123'
            }
          },
          {
            path: ['$.credentialSubject.chargingData.timestamp'],
            filter: {
              type: 'string',
              const: '2022-04-05T15:45:35.346Z'
            }
          },
          {
            path: ['$.credentialSubject.chargingData.kwh'],
            filter: {
              type: 'string',
              const: '5'
            }
          }
        ]
      }
    }
  ]
};

export const energyContractCredential: CredentialDto = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    {
      value: 'ew:value',
      namespace: 'ew:namespace',
      ew: 'https://energyweb.org/ld-context-2022#',
      key: 'ew:key',
      role: { '@id': 'ew:role', '@type': 'ew:Role' },
      version: 'ew:version',
      EWFRole: 'ew:EWFRole',
      issuerFields: { '@id': 'ew:issuerFields', '@type': 'ew:IssuerFields' }
    }
  ],
  id: 'urn:uuid:7f94d397-3e70-4a43-945e-1a13069e636f',
  type: ['VerifiableCredential', 'EWFRole'],
  credentialSubject: {
    id: 'did:example:d23dd687a7dc6787646f2eb98d0',
    issuerFields: [{ key: 'accountId', value: 'energycustomerid1' }],
    role: {
      namespace: 'customer.roles.rebeam.apps.eliagroup.iam.ewc',
      version: '1'
    }
  },
  issuer: did,
  issuanceDate: '2022-03-18T08:57:32.477Z'
};

export const getChargingDataCredential: (issuerDid: string) => CredentialDto = (issuerDid) => {
  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      {
        timestamp: 'ew:timestamp',
        kwh: 'ew:kwh',
        chargingData: { '@id': 'ew:chargingData', '@type': 'ew:chargingData' },
        ChargingData: 'ew:ChargingData',
        contractDID: 'ew:contractDID',
        evseId: 'ew:evseId',
        ew: 'https://energyweb.org/ld-context-2022#'
      }
    ],
    id: 'urn:uuid:a6032135-75d6-4019-b59d-420168c7cd85',
    type: ['VerifiableCredential', 'ChargingData'],
    credentialSubject: {
      id: issuerDid,
      chargingData: {
        contractDID: 'did:ethr:blxm-local:0x429eCb49aAC34E076f19D5C91d7e8B956AEf9c08',
        evseId: '123',
        kwh: '5',
        timestamp: '2022-04-05T15:45:35.346Z'
      }
    },
    issuer: issuerDid,
    issuanceDate: '2022-03-18T08:57:32.477Z'
  };
};

export const energyContractVerifiableCredential: VerifiableCredential = {
  ...energyContractCredential,
  proof: {
    type: 'Ed25519Signature2018',
    proofPurpose: 'assertionMethod',
    verificationMethod:
      'did:key:z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF#z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF',
    created: '2021-11-16T14:52:19.514Z',
    jws: 'eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..zgBHxtdwo17BK6EZCQik9Bxa_rLn-B2DgK3bkCVFZWQqlWb-W7goxPWBqidUrr2iufYoFdsdQwmoYBeu973YBA'
  }
};

export const chargingDataVerifiableCredential: VerifiableCredential = {
  ...getChargingDataCredential(did),
  proof: {
    type: 'Ed25519Signature2018',
    proofPurpose: 'assertionMethod',
    verificationMethod:
      'did:key:z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF#z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF',
    created: '2021-11-16T14:52:19.514Z',
    jws: 'eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..jR_OEYZlIcsVBfBp-tDWXbnShFlHIEuRkLdocQrclbE-RrqaHER9QYUsIFsz-Xs269gASS0qX37AcjrcrIi3Cw'
  }
};

export const rebeamPresentation: Presentation = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    {
      PresentationSubmission: {
        '@id': 'https://identity.foundation/presentation-exchange/#presentation-submission',
        '@context': {
          '@version': '1.1',
          presentation_submission: {
            '@id': 'https://identity.foundation/presentation-exchange/#presentation-submission',
            '@type': '@json'
          }
        }
      }
    }
  ],
  type: ['VerifiablePresentation', 'PresentationSubmission'],
  holder: undefined,
  presentation_submission: {
    id: 'fNFNZOX44ASUEZFPaopjI',
    definition_id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
    descriptor_map: [
      {
        id: 'energy_supplier_customer_contract',
        format: 'ldp_vc',
        path: '$.verifiableCredential[0]'
      },
      {
        id: 'charging_data',
        format: 'ldp_vc',
        path: '$.verifiableCredential[1]'
      }
    ]
  },
  verifiableCredential: [energyContractVerifiableCredential, chargingDataVerifiableCredential]
} as Presentation;

export const rebeamVerifiablePresentation = {
  ...rebeamPresentation,
  proof: {
    type: 'Ed25519Signature2018',
    proofPurpose: 'authentication',
    verificationMethod:
      'did:key:z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF#z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF',
    created: '2022-05-23T11:11:07.777Z',
    jws: 'eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..E4Tk6RGBmazl1k1iJ6itu0sUOWz7tRkJf-GP1nPXmoFmfdPH2uEEwTBlSvPSTfTkyZxCs_ra7nfVUCLtkqWIAA'
  }
};
