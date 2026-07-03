/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsOptional, ValidateNested } from 'class-validator';
import { VerifiablePresentationDto } from '../../credentials/dtos/verifiable-presentation.dto';
import { VpRequestDto } from './vp-request.dto';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Describes the possible body of a request to participate an exchange.
 */
export class ParticipateInExchangeDto {
  @ValidateNested()
  @Type(() => VpRequestDto)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Verifiable Presentation Request.\n' + 'Should conform to VP Request specification.'
  })
  verifiablePresentationRequest?: VpRequestDto;

  @ValidateNested()
  @Type(() => VerifiablePresentationDto)
  @IsOptional()
  @ApiPropertyOptional({ description: 'A JSON-LD Verifiable Presentation with a proof.' })
  verifiablePresentation?: VerifiablePresentationDto;
}
