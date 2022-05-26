import { keyToDID } from '@spruceid/didkit-wasm-node';

export const key = {
  kty: 'OKP',
  crv: 'Ed25519',
  x: 'gZbb93kdEoQ9Be78z7NG064wBq8Vv_0zR-qglxkiJ-g',
  d: 'XXugDYUEtINLUefOLeztqOOtPukVIvNPreMTzl6wKgA',
  kid: 'zWME913jdYrILuYD-ot-jDbmzqz34HqlCUZ6CMdJnyo'
};

export const did = keyToDID('key', JSON.stringify(key)); // "did:key:z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF"
export const didDoc = {
  id: 'did:key:z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF',
  verificationMethod: [
    {
      id: 'did:key:z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF#z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF',
      type: 'Ed25519VerificationKey2018',
      controller: 'did:key:z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF',
      publicKeyJwk: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'gZbb93kdEoQ9Be78z7NG064wBq8Vv_0zR-qglxkiJ-g',
        d: 'XXugDYUEtINLUefOLeztqOOtPukVIvNPreMTzl6wKgA',
        kid: 'zWME913jdYrILuYD-ot-jDbmzqz34HqlCUZ6CMdJnyo'
      }
    }
  ]
};

export const challenge = '2679f7f3-d9ff-4a7e-945c-0f30fb0765bd';
