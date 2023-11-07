/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { BadRequestException } from '@nestjs/common';

/**
 * This function reduces repeatability of code when calling didkid methods that require exceptions
 * thrown to be additionally checked and to be decided if `BadRequestException` needs to be thrown.
 */
export async function didKitExecutor<T>(
  closure: () => Promise<string>,
  didKitFunctionName: string
): Promise<T> {
  const serializedJson = await closure().catch((err) => {
    if (typeof err === 'string') {
      // assumption is that non-didkit errors will be of object type
      throw new BadRequestException(`@spruceid/didkit-wasm-node.${didKitFunctionName} error: ${err}`);
    }

    throw err;
  });

  try {
    return JSON.parse(serializedJson) as T;
  } catch (err) {
    throw Error(`@spruceid/didkit-wasm-node.${didKitFunctionName} returned unparseable result`);
  }
}
