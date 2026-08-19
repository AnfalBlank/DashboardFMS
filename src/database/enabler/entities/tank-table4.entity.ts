import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tank_table4')
export class EnablerTankTable4 {
  @PrimaryColumn({ name: 'A' })
  A: number;

  @Column({ name: 'B' })
  B: number;
}
