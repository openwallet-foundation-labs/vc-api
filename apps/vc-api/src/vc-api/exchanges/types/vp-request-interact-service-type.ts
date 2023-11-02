/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The interact service types that are both
 * - supported by the wallet app
 * - listed in the VP Request spec https://w3c-ccg.github.io/vp-request-spec/#interaction-types
 */
export enum VpRequestInteractServiceType {
  /**
   * https://w3c-ccg.github.io/vp-request-spec/#unmediated-presentation
   */
  unmediatedPresentation = 'UnmediatedHttpPresentationService2021',

  /**
   * See https://w3c-ccg.github.io/vp-request-spec/#mediated-presentation for background.
   * Note that the specification (as of v0.1, 25-04-2022), refers to "MediatedBrowserPresentationService2021".
   * This [GitHub issue](https://github.com/w3c-ccg/vp-request-spec/issues/17) is open to discuss the usage of Mediated Presentations Services
   */
  mediatedPresentation = 'MediatedHttpPresentationService2021'
}
