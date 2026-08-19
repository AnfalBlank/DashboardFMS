import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tap_kartu_order')
export class EnablerTapKartuOrder {
  @PrimaryColumn({ name: 'no' })
  no: number;

  @Column('text', { name: 'jenis_kartu' })
  jenis_kartu: string;

  @Column({ name: 'order_flag' })
  order_flag: number;

  @Column({ name: 'tap_kartu_flag' })
  tap_kartu_flag: number;

  @Column('text', { name: 'user_name' })
  user_name: string;

  @Column('text', { name: 'user_rfid_number' })
  user_rfid_number: string;
}
