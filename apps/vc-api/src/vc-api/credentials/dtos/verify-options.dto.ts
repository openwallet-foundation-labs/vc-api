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

import { ProofPurpose } from '@sphereon/pex';
import { IsString, IsOptional } from 'class-validator';
import { VerifyOptions } from '../types/verify-options';

/**
 * Parameters for verifying a verifiable credential or a verifiable presentation
 * https://w3c-ccg.github.io/vc-api/verifier.html#operation/verifyCredential
 * https://w3c-ccg.github.io/vc-api/verifier.html#operation/verifyPresentation
 */
export class VerifyOptionsDto implements VerifyOptions {
  /**
   * The URI of the verificationMethod used for the proof. Default assertionMethod URI.
   */
  @IsString()
  @IsOptional()
  verificationMethod?: string;

  /**
   * The purpose of the proof. Default 'assertionMethod'.
   */
  @IsString()
  @IsOptional()
  proofPurpose?: ProofPurpose;

  /**
   * The date and time of the proof (with a maximum accuracy in seconds). Default current system time.
   */
  @IsString()
  @IsOptional()
  created?: string;

  /**
   * A challenge provided by the requesting party of the proof. For example 6e62f66e-67de-11eb-b490-ef3eeefa55f2
   */
  @IsString()
  @IsOptional()
  challenge?: string;

  /**
   * The intended domain of validity for the proof. For example website.example
   */
  @IsString()
  @IsOptional()
  domain?: string;
}
