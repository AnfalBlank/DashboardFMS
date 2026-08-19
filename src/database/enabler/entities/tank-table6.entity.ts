import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tank_table6')
export class EnablerTankTable6 {
  @PrimaryColumn({ name: 'A' })
  A: number;

  @Column({ name: 'B' })
  B: number;
}
