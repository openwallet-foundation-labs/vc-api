import { IKeyGenResult, ISecp256k1KeyGen } from '@energyweb/ssi-kms-interface';
import { utils } from 'ethers';
import keyto from '@trust/keyto';
import { EthrDID } from './ethrDID';

const { computeAddress } = utils;

export class EthrDIDFactory {
  private readonly _keyGen: ISecp256k1KeyGen
  public constructor(keyGen: ISecp256k1KeyGen) {
    this._keyGen = keyGen;
  }

  public async generate(): Promise<EthrDID> {
    const controllingKey: IKeyGenResult = await this._keyGen.generateSecp256k1();

    // Converting from JWK to hex as this is what computeAddress function accepts
    // Use of keyto inspired by https://github.com/decentralized-identity/EcdsaSecp256k1RecoverySignature2020/blob/3b6dc297f92abc912049121c38c1098d819855d2/src/ES256K-R.js#L48
    const uncompressedPublicKey = keyto
      .from(
        {
          ...controllingKey.publicKeyJWK,
          crv: 'K-256'
        },
        'jwk'
      )
      .toString('blk', 'public');
    const address = computeAddress(`0x${uncompressedPublicKey}`);

    const ethrDID = new EthrDID();
    ethrDID.did = `did:ethr:volta:${address}`;
    ethrDID.controllingKeyThumbprint = controllingKey.publicKeyThumbprint;
    return ethrDID;
  }
}
