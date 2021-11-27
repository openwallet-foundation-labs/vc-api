import { IsString, IsUrl } from 'class-validator';

/**
 * An offer for a verifiable credential that an issuer can put forward
 * Inspired by:
 * - Discussion on this VC API issue: {@link https://github.com/w3c-ccg/vc-api/issues/245#issuecomment-978175085}
 * - The Spruce "CredentialOffer". TODO: see if CredentialOffer is defined anyway outside of spruce.
 *   I think Spruce assumes user is already authenticated when generating the offer?
 *   {@link https://spruceid.dev/docs/credible/concepts/#offer-flow}
 *   {@link https://github.com/spruceid/didkit/blob/1b4092bd7578f82bfd062485a868a07e2192cbd3/examples/java-springboot/src/main/java/com/spruceid/didkitexample/entity/credentialoffer/CredentialOffer.java#L12}
 *   {@link https://github.com/spruceid/didkit/blob/1b4092bd7578f82bfd062485a868a07e2192cbd3/examples/java-springboot/src/main/java/com/spruceid/didkitexample/controller/CredentialOfferController.java#L73}
 */
export class CredentialOfferDto {
  /**
   * The type of the credential being offered
   */
  @IsString()
  typeAvailable: string;

  /**
   * The Url at which the issuance request can be made
   */
  @IsUrl()
  vcRequestUrl: string;
}
