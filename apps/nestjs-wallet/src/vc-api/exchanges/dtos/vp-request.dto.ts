import { classToPlain, plainToClass, Type } from 'class-transformer';
import { IsArray, IsObject, IsString, ValidateNested } from 'class-validator';
import { VpRequestEntity } from '../entities/vp-request.entity';
import { VpRequestInteractDto } from './vp-request-interact.dto';
import { VpRequestQueryDto } from './vp-request-query.dto';

/**
 * VP Request DTO
 * Should conform to https://w3c-ccg.github.io/vp-request-spec
 */
export class VpRequestDto {
  /**
   * From https://w3c-ccg.github.io/vp-request-spec/#format :
   * "Challenge that will be digitally signed in the authentication proof
   *  that will be attached to the VerifiablePresentation response"
   */
  @IsString()
  challenge: string;

  /**
   * From https://w3c-ccg.github.io/vp-request-spec/#format :
   * "To make a request for one or more objects wrapped in a Verifiable Presentation,
   *  a client constructs a JSON request describing one or more queries that it wishes to perform from the receiver."
   * "The query type serves as the main extension point mechanism for requests for data in the presentation.
   *  This document defines several common query types."
   */
  @IsArray()
  query: VpRequestQueryDto[];

  @ValidateNested()
  interact?: VpRequestInteractDto;

  static toDto(vpRequestEntity: VpRequestEntity): VpRequestDto {
    const data = classToPlain(vpRequestEntity);
    return plainToClass(VpRequestEntity, data);
  }
}
