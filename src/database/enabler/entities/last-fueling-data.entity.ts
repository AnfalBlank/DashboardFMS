import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('last_fueling_data')
export class EnablerLastFuelingData {
  @Column({ name: 'index_ip' })
  index_ip: number;

  @PrimaryColumn({ name: 'index_pump' })
  index_pump: number;

  @Column({ name: 'no_urut' })
  no_urut: number;

  @Column({ name: 'id_nozzle' })
  id_nozzle: number;

  @Column({ name: 'id_product' })
  id_product: number;

  @Column('text', { name: 'amount' })
  amount: string;

  @Column('text', { name: 'volume' })
  volume: string;

  @Column('text', { name: 'unit_price' })
  unit_price: string;

  @Column('datetime', { name: 'waktu' })
  waktu: Date;

  @Column('text', { name: 'status' })
  status: string;

  @Column('text', { name: 'number_shift' })
  number_shift: string;

  @Column('text', { name: 'print_flag' })
  print_flag: string;

  @Column('text', { name: 'total_volume' })
  total_volume: string;

  @Column('text', { name: 'total_amount' })
  total_amount: string;
}
