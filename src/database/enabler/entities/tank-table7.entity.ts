import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tank_table7')
export class EnablerTankTable7 {
  @PrimaryColumn({ name: 'A' })
  A: number;

  @Column({ name: 'B' })
  B: number;
}
