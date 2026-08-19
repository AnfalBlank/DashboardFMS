import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tank_table3')
export class EnablerTankTable3 {
  @PrimaryColumn({ name: 'A' })
  A: number;

  @Column({ name: 'B' })
  B: number;
}
