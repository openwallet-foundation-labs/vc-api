import { IPresentationDefinition } from '@sphereon/pex';
import { IsPresentationDefinitionCredentialQuery } from './custom-validators/presentation-definition-credential-query.validator';

export class VpRequestPresentationDefinitionQueryDto {
  @IsPresentationDefinitionCredentialQuery()
  presentationDefinition: IPresentationDefinition;
}
