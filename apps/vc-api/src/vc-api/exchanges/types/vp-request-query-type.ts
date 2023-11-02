/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Query types as listed in the VP Request spec.
 * https://w3c-ccg.github.io/vp-request-spec/#query-types
 *
 */
export enum VpRequestQueryType {
  /**
   * https://w3c-ccg.github.io/vp-request-spec/#did-authentication-request
   */
  didAuth = 'DIDAuth',

  /**
   * A presentation definition https://identity.foundation/presentation-exchange/#presentation-definition
   * This type is proposed here: https://github.com/w3c-ccg/vp-request-spec/issues/7
   */
  presentationDefinition = 'PresentationDefinition'
}
