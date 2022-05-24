import { keyToDID } from '@spruceid/didkit-wasm-node';

export const key = {
  kty: 'OKP',
  crv: 'Ed25519',
  x: 'gZbb93kdEoQ9Be78z7NG064wBq8Vv_0zR-qglxkiJ-g',
  d: 'XXugDYUEtINLUefOLeztqOOtPukVIvNPreMTzl6wKgA'
};

export const did = keyToDID('key', JSON.stringify(key));

export const challenge = '2679f7f3-d9ff-4a7e-945c-0f30fb0765bd';
