import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tank_table2')
export class EnablerTankTable2 {
  @PrimaryColumn({ name: 'A' })
  A: number;

  @Column({ name: 'B' })
  B: number;
}
