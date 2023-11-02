/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { VerifyOptionsDto } from './verify-options.dto';
import { IsDefined, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { VerifiablePresentationDto } from './verifiable-presentation.dto';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPresentationDto {
  @IsObject()
  @IsDefined()
  @ValidateNested()
  @Type(() => VerifiablePresentationDto)
  @ApiProperty({
    description:
      'A JSON-LD Verifiable Credential with a proof. ' +
      'https://w3c-ccg.github.io/vc-api/issuer.html#operation/issueCredential'
  })
  verifiablePresentation: VerifiablePresentationDto;

  @IsObject()
  @IsDefined()
  @ValidateNested()
  @Type(() => VerifyOptionsDto)
  @ApiProperty({
    description:
      'Parameters for verifying a verifiable credential or a verifiable presentation ' +
      'https://w3c-ccg.github.io/vc-api/verifier.html#operation/verifyCredential ' +
      'https://w3c-ccg.github.io/vc-api/verifier.html#operation/verifyPresentation'
  })
  options: VerifyOptionsDto;
}
