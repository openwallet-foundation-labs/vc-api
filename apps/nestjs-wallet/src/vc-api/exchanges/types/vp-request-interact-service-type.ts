/**
 * These should be the interact service types that are both
 * - supported by the wallet app
 * - listed in the VP Request spec https://w3c-ccg.github.io/vp-request-spec/#interaction-types
 */
export enum VpRequestInteractServiceType {
  /**
   * https://w3c-ccg.github.io/vp-request-spec/#unmediated-presentation
   */
  unmediatedPresentation = 'UnmediatedHttpPresentationService2021'
}
