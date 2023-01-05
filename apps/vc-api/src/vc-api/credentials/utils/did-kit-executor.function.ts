/*
 * Copyright 2021 - 2023 Energy Web Foundation
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
