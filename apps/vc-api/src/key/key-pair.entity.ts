import { JWK } from 'jose';
import { Entity, Column } from 'typeorm';

/**
 * An entity representing a stored KeyPair
 */
@Entity()
export class KeyPair {
  @Column('text', { primary: true })
  public publicKeyThumbprint: string;

  @Column('simple-json')
  public privateKeyJWK: JWK;

  @Column('simple-json')
  public publicKeyJWK: JWK;
}
