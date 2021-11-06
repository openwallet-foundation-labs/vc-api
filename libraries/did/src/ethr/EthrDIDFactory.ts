import { ISecp256k1KeyGen } from '@energyweb/ssi-kms-interface';
import { utils } from 'ethers';
import { calculateJwkThumbprint, JWK } from 'jose';
import keyto from '@trust/keyto';
import { EthrDID } from './ethrDID';

const { computeAddress } = utils;

export class EthrDIDFactory {
  private readonly _keyGen: ISecp256k1KeyGen
  public constructor(keyGen: ISecp256k1KeyGen) {
    this._keyGen = keyGen;
  }

  public async create(): Promise<EthrDID> {
    const controllingKey: JWK = await this._keyGen.generateSecp256k1();
    const uncompressedPublicKey = keyto
      .from(
        {
          ...controllingKey,
          crv: 'K-256'
        },
        'jwk'
      )
      .toString('blk', 'public');
    const address = computeAddress(`0x${uncompressedPublicKey}`);
    const ethrDID = new EthrDID();
    ethrDID.did = `did:ethr:volta:${address}`;
    ethrDID.controllingKeyThumbprint = await calculateJwkThumbprint(controllingKey, "sha256");
    return ethrDID;
  }
}
