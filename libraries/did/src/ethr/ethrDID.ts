import { Entity, Column } from 'typeorm';

/**
 * An entity representing a DID for the "ethr" DID method
 * It has typeorm annotations so that it can be used directly in apps
 * https://github.com/typeorm/typeorm/blob/master/docs/entities.md
 * TODO: Remove definite assignment assertion (!) from properties. Need to check if still works if using constructor
 */
@Entity()
export class EthrDID {
  @Column('text', { primary: true })
  public did!: string;

  @Column('text')
  public controllingKeyThumbprint!: string;
}
