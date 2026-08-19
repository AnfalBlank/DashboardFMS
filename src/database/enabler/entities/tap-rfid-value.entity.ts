import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tap_rfid_value')
export class EnablerTapRfidValue {
  @PrimaryColumn({ name: 'no' })
  no: number;

  @Column({ name: 'id_user' })
  id_user: number;

  @Column('text', { name: 'user_name' })
  user_name: string;

  @Column('text', { name: 'nopol' })
  nopol: string;

  @Column('text', { name: 'saldo' })
  saldo: string;

  @Column('text', { name: 'produk' })
  produk: string;

  @Column('text', { name: 'keterangan' })
  keterangan: string;

  @Column({ name: 'tap_flag' })
  tap_flag: number;

  @Column('datetime', { name: 'waktu' })
  waktu: Date;
}
