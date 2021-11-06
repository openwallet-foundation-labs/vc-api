import { Entity, Column } from 'typeorm';

//TODO: Remove definite assignment assertion (!) from properties
@Entity()
export class EthrDID {
  @Column('text', { primary: true })
  public did!: string;

  @Column('text')
  public controllingKeyThumbprint!: string;
}
