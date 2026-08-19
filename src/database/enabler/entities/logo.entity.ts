import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('logo')
export class EnablerLogo {
  @PrimaryColumn({ name: 'no' })
  no: number;

  @Column({ name: 'index_logo' })
  index_logo: number;
}
