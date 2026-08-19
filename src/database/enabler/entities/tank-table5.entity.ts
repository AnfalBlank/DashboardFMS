import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tank_table5')
export class EnablerTankTable5 {
  @PrimaryColumn({ name: 'A' })
  A: number;

  @Column({ name: 'B' })
  B: number;
}
