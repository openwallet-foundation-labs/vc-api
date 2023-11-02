/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { classToPlain, plainToClass, Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { VpRequestEntity } from '../entities/vp-request.entity';
import { VpRequestInteractDto } from './vp-request-interact.dto';
import { VpRequestQueryDto } from './vp-request-query.dto';
import { ApiProperty } from '@nestjs/swagger';

/**
 * VP Request DTO
 * Should conform to https://w3c-ccg.github.io/vp-request-spec
 */
export class VpRequestDto {
  @IsString()
  @ApiProperty({
    description:
      'From https://w3c-ccg.github.io/vp-request-spec/#format :\n' +
      '"Challenge that will be digitally signed in the authentication proof\n' +
      'that will be attached to the VerifiablePresentation response"'
  })
  challenge: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VpRequestQueryDto)
  @ApiProperty({
    description:
      'From https://w3c-ccg.github.io/vp-request-spec/#format :\n' +
      '"To make a request for one or more objects wrapped in a Verifiable Presentation,\n' +
      'a client constructs a JSON request describing one or more queries that it wishes to perform from the receiver."\n' +
      '"The query type serves as the main extension point mechanism for requests for data in the presentation.\n' +
      'This document defines several common query types."',
    type: VpRequestQueryDto,
    isArray: true
  })
  query: VpRequestQueryDto[];

  @ValidateNested()
  @Type(() => VpRequestInteractDto)
  @ApiProperty()
  interact: VpRequestInteractDto;

  static toDto(vpRequestEntity: VpRequestEntity): VpRequestDto {
    const data = classToPlain(vpRequestEntity);
    return plainToClass(VpRequestEntity, data);
  }
}
