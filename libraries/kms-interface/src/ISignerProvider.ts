import { Wallet } from 'ethers';

export interface ISignerProvider {
  // Currently need to return wallet as iam-client-lib needs private key
  // but iam-client-lib should just be able to accept signer
  getSignerForDID(did: string): Promise<Wallet | undefined>;

  getAllSigners(): Promise<Wallet[]>;
}
