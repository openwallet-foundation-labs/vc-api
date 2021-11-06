import { Entity, Column } from 'typeorm';

//TODO: Remove definite assignment assertion (!) from properties
@Entity()
export class EthrDID {
  @Column('string')
  public did!: string;

  @Column('string')
  public controllingKeyThumbprint!: string;
}
