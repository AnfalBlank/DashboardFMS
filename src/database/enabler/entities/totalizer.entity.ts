import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('totalizer')
export class EnablerTotalizer {
  @PrimaryColumn({ name: 'id_nozzle' })
  id_nozzle: number;

  @PrimaryColumn({ name: 'index_pump' })
  index_pump: number;

  @Column({ name: 'index_dispenser' })
  index_dispenser: number;

  @PrimaryColumn({ name: 'index_ip' })
  index_ip: number;

  @Column({ name: 'id_product' })
  id_product: number;

  @Column('text', { name: 'total_amount_akhir' })
  total_amount_akhir: string;

  @Column('text', { name: 'total_volume_akhir' })
  total_volume_akhir: string;

  @Column('text', { name: 'total_volume_acc' })
  total_volume_acc: string;

  @Column('text', { name: 'total_amount_acc' })
  total_amount_acc: string;
}
