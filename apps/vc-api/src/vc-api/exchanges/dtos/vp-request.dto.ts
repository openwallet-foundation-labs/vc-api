/**
 * Copyright 2021, 2022 Energy Web Foundation
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
  @ValidateNested({ each: true })
  @Type(() => VpRequestQueryDto)
  query: VpRequestQueryDto[];

  @ValidateNested()
  @Type(() => VpRequestInteractDto)
  interact: VpRequestInteractDto;

  static toDto(vpRequestEntity: VpRequestEntity): VpRequestDto {
    const data = classToPlain(vpRequestEntity);
    return plainToClass(VpRequestEntity, data);
  }
}
