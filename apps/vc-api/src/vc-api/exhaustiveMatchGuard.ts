/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Guard that can be used for pattern matching
 * Used to ensure that all paths in a switch are exhaustive
 * See https://medium.com/technogise/type-safe-and-exhaustive-switch-statements-aka-pattern-matching-in-typescript-e3febd433a7a
 */
export const exhaustiveMatchGuard = (_: never): never => {
  throw new Error('Should not have reached here');
};
