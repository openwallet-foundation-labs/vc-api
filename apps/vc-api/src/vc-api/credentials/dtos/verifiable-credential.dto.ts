/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsObject } from 'class-validator';
import { CredentialDto } from './credential.dto';
import { ApiProperty } from '@nestjs/swagger';

/**
 * A JSON-LD Verifiable Credential with a proof.
 * https://w3c-ccg.github.io/vc-api/issuer.html#operation/issueCredential
 */
export class VerifiableCredentialDto extends CredentialDto {
  @IsObject()
  @ApiProperty({ description: 'A JSON-LD Linked Data proof.' })
  proof: Record<string, unknown>;
}
