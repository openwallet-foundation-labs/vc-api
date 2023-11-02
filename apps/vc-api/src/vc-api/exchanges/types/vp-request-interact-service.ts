/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { VpRequestInteractServiceType } from './vp-request-interact-service-type';

export interface VpRequestInteractService {
  type: VpRequestInteractServiceType;
  serviceEndpoint: string;
}
