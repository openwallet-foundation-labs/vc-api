import { TypedArrayEncoder } from '@credo-ts/core';

export const Base64ToBase58 = (base64: string): string => {
  // Buffer accepts both standard and url-safe base64, with or without
  // padding (Credo 0.7's TypedArrayEncoder.fromBase64 is strict about both)
  return TypedArrayEncoder.toBase58(Buffer.from(base64, 'base64'));
};
