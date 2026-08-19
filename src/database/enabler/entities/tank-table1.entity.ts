import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tank_table1')
export class EnablerTankTable1 {
  @PrimaryColumn({ name: 'A' })
  A: number;

  @Column({ name: 'B' })
  B: number;
}
