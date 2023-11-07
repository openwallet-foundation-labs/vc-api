/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsObject } from 'class-validator';
import { PresentationDto } from './presentation.dto';
import { ApiProperty } from '@nestjs/swagger';

/**
 * A JSON-LD Verifiable Presentation with a proof.
 * https://w3c-ccg.github.io/vc-api/verifier.html#operation/verifyPresentation
 */
export class VerifiablePresentationDto extends PresentationDto {
  @IsObject()
  @ApiProperty({ description: 'A JSON-LD Linked Data proof.' })
  proof: Record<string, unknown>;
}
