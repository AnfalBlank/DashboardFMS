import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('nama_product')
export class EnablerNamaProduct {
  @PrimaryColumn({ name: 'no' })
  no: number;

  @Column({ name: 'index_pump' })
  index_pump: number;

  @Column({ name: 'index_nozzle' })
  index_nozzle: number;

  @Column('text', { name: 'nama_product' })
  nama_product: string;

  @Column('text', { name: 'tank_number', nullable: true })
  tank_number: string;
}
