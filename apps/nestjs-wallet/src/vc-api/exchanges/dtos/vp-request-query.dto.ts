import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { VpRequestQueryType } from '../types/vp-request-query-type';
import { VpRequestDidAuthQueryDto } from './vp-request-did-auth-query.dto';
import { VpRequestPresentationDefinitionQueryDto } from './vp-request-presentation-defintion-query.dto';

/**
 * https://w3c-ccg.github.io/vp-request-spec/#query-types
 */
export class VpRequestQueryDto {
  @IsEnum(VpRequestQueryType)
  type: VpRequestQueryType;

  /**
   * https://github.com/typestack/class-validator/issues/566#issuecomment-605515267
   */
  @ValidateNested({ each: true })
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(1)
  @Type(() => VpRequestPresentationDefinitionQueryDto, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: VpRequestPresentationDefinitionQueryDto, name: VpRequestQueryType.presentationDefinition },
        { value: VpRequestDidAuthQueryDto, name: VpRequestQueryType.didAuth }
      ]
    }
  })
  credentialQuery: Array<VpRequestPresentationDefinitionQueryDto | VpRequestDidAuthQueryDto>;
}
