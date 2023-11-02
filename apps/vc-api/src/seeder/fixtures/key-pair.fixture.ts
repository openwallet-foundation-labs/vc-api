/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { KeyPair } from '../../key/key-pair.entity';

export const keyPairFixture: KeyPair[] = [
  {
    publicKeyThumbprint: 'Cb-dMbY5dpIuJiEAZpSFmMS45xG9U1IGTZ6fu-0_Y2Q',
    privateKey: {
      crv: 'Ed25519',
      d: 'rp_w8CI32yfCiF-C-8sX9nBjss7DVw6rJD-OOAkG4Jw',
      x: 'xlIb-qSN_fdmZNvM17C9QoW8qJ_kSFoyD2O534vNAbM',
      kty: 'OKP'
    },
    publicKey: {
      crv: 'Ed25519',
      x: 'xlIb-qSN_fdmZNvM17C9QoW8qJ_kSFoyD2O534vNAbM',
      kty: 'OKP',
      kid: 'Cb-dMbY5dpIuJiEAZpSFmMS45xG9U1IGTZ6fu-0_Y2Q'
    }
  },
  {
    publicKeyThumbprint: 'DnxN3-MVQwLsGPxI_XSeOxpsirM7RJYYtyzDjWGi1hc',
    privateKey: {
      crv: 'Ed25519',
      d: 'zH2tR4S1_g1ETHatMu1dzC2AJ7pO8L_iPrAYbxrh4qs',
      x: 'QJVXmSVxPrIRx5KlZwx0Zi_8K12zf4BXj_GWwSu0Ep8',
      kty: 'OKP'
    },
    publicKey: {
      crv: 'Ed25519',
      x: 'QJVXmSVxPrIRx5KlZwx0Zi_8K12zf4BXj_GWwSu0Ep8',
      kty: 'OKP',
      kid: 'DnxN3-MVQwLsGPxI_XSeOxpsirM7RJYYtyzDjWGi1hc'
    }
  }
];
