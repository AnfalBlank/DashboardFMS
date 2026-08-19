import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tank_table')
export class EnablerTankTable {
  @PrimaryColumn({ name: 'A' })
  A: number;

  @Column({ name: 'B', nullable: true })
  B: number;
}
