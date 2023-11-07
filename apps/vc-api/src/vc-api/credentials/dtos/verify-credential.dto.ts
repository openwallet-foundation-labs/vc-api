/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { VerifiableCredentialDto } from './verifiable-credential.dto';
import { VerifyOptionsDto } from './verify-options.dto';

import { IsObject, ValidateNested, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyCredentialDto {
  /**
   * A JSON-LD Verifiable Credential with a proof.
   * https://w3c-ccg.github.io/vc-api/issuer.html#operation/issueCredential
   */
  @IsObject()
  @IsDefined()
  @ValidateNested()
  @Type(() => VerifiableCredentialDto)
  @ApiProperty({
    description:
      'A JSON-LD Verifiable Credential with a proof. ' +
      'https://w3c-ccg.github.io/vc-api/issuer.html#operation/issueCredential'
  })
  verifiableCredential: VerifiableCredentialDto;

  /**
   * Parameters for verifying a verifiable credential or a verifiable presentation
   * https://w3c-ccg.github.io/vc-api/verifier.html#operation/verifyCredential
   * https://w3c-ccg.github.io/vc-api/verifier.html#operation/verifyPresentation
   */
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
