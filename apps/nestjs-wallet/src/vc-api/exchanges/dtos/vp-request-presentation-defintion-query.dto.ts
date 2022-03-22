import { IPresentationDefinition } from '@sphereon/pex';
import { IsPresentationDefinitionCredentialQuery } from './custom-validators/presentation-definition-credential-query.validator';

/**
 * https://github.com/w3c-ccg/vp-request-spec/issues/7#issuecomment-1067036904
 */
export class VpRequestPresentationDefinitionQueryDto {
  @IsPresentationDefinitionCredentialQuery()
  presentationDefinition: IPresentationDefinition;
}
