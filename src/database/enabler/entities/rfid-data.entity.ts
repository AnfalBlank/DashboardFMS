import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('rfid_data')
export class EnablerRfidData {
  @PrimaryGeneratedColumn({ name: 'no' })
  no: number;

  @Column('text', { name: 'rfid_number' })
  rfid_number: string;

  @Column('text', { name: 'user_id' })
  user_id: string;

  @Column('text', { name: 'user_name' })
  user_name: string;

  @Column({ name: 'aktif_flag' })
  aktif_flag: number;

  @Column('text', { name: 'status' })
  status: string;

  @Column({ name: 'login_flag' })
  login_flag: number;

  @Column('text', { name: 'nopol' })
  nopol: string;

  @Column('text', { name: 'saldo' })
  saldo: string;

  @Column('text', { name: 'produk' })
  produk: string;
}
