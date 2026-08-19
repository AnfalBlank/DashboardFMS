import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('harga_product')
export class EnablerHargaProduct {
  @PrimaryColumn({ name: 'no' })
  no: number;

  @Column({ name: 'index_pump' })
  index_pump: number;

  @Column({ name: 'index_nozzle' })
  index_nozzle: number;

  @Column('text', { name: 'harga_product' })
  harga_product: string;

  @Column('text', { name: 'harga_dispenser' })
  harga_dispenser: string;
}
