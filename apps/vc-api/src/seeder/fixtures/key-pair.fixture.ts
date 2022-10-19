/*
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
