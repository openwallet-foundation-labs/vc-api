/**
 * These should be the credential query types that are both
 * - supported by the wallet app
 * - listed in the VP Request spec https://w3c-ccg.github.io/vp-request-spec/#query-types
 *
 * That said, a "PresentationDefinition" type is proposed here https://github.com/w3c-ccg/vp-request-spec/issues/7
 */
export enum VpRequestQueryType {
  /**
   * https://w3c-ccg.github.io/vp-request-spec/#did-authentication-request
   */
  didAuth = 'DIDAuth',

  /**
   * A presentation definition https://identity.foundation/presentation-exchange/#presentation-definition
   */
  presentationDefinition = 'PresentationDefinition'
}
