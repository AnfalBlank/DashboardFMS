import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('fueling_data')
export class EnablerFuelingData {
  @Column({ name: 'no_urut', nullable: true })
  no_urut: number;

  @Column({ name: 'index_ip', nullable: true })
  index_ip: number;

  @Column({ name: 'index_pump', nullable: true })
  index_pump: number;

  @Column({ name: 'id_nozzle', nullable: true })
  id_nozzle: number;

  @Column({ name: 'id_product', nullable: true })
  id_product: number;

  @Column('text', { name: 'amount', nullable: true })
  amount: string;

  @Column('text', { name: 'volume', nullable: true })
  volume: string;

  @Column('text', { name: 'unit_price', nullable: true })
  unit_price: string;

  @Column('datetime', { name: 'waktu', nullable: true })
  waktu: Date;

  @Column('text', { name: 'status', nullable: true })
  status: string;

  @Column({ name: 'number_shift', nullable: true })
  number_shift: number;

  @Column('text', { name: 'total_volume', nullable: true })
  total_volume: string;

  @Column('text', { name: 'total_amount', nullable: true })
  total_amount: string;

  @Column('text', { name: 'barcode', nullable: true })
  barcode: string;

  @Column('datetime', { name: 'waktu_kirim' })
  waktu_kirim: Date;

  @Column({ name: 'send_server_flag', nullable: true })
  send_server_flag: number;

  @Column('text', { name: 'user_name', nullable: true })
  user_name: string;

  @Column('text', { name: 'ip_address', nullable: true })
  ip_address: string;

  @Column('text', { name: 'volume_minyak_atg', nullable: true })
  volume_minyak_atg: string;

  @Column('text', { name: 'tinggi_minyak_atg', nullable: true })
  tinggi_minyak_atg: string;

  @Column({ name: 'print_counter', nullable: true })
  print_counter: number;

  @Column({ name: 'id_loop', nullable: true })
  id_loop: number;

  @PrimaryGeneratedColumn({ name: 'no_sistem' })
  no_sistem: number;

  @Column('text', { name: 'id_preset' })
  id_preset: string;
}
