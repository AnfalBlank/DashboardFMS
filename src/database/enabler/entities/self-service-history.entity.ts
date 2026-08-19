import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('self_service_history')
export class EnablerSelfServiceHistory {
  @PrimaryGeneratedColumn({ name: 'id_self_service' })
  id_self_service: number;

  @Column({ name: 'id_pump' })
  id_pump: number;

  @Column('text', { name: 'nama_produk' })
  nama_produk: string;

  @Column('text', { name: 'jenis_verifikasi' })
  jenis_verifikasi: string;

  @Column('text', { name: 'input_verifikasi' })
  input_verifikasi: string;

  @Column('text', { name: 'tipe_subsidi' })
  tipe_subsidi: string;

  @Column('text', { name: 'jenis_subsidi' })
  jenis_subsidi: string;

  @Column('text', { name: 'id_validation_subsidi' })
  id_validation_subsidi: string;

  @Column('text', { name: 'max_kuota_subsidi' })
  max_kuota_subsidi: string;

  @Column('text', { name: 'sisa_kuota_subsidi' })
  sisa_kuota_subsidi: string;

  @Column('text', { name: 'nilai_preset' })
  nilai_preset: string;

  @Column('text', { name: 'jenis_preset' })
  jenis_preset: string;

  @Column('text', { name: 'jenis_pembayaran' })
  jenis_pembayaran: string;

  @Column('text', { name: 'id_transaction_mypertamina' })
  id_transaction_mypertamina: string;

  @Column('text', { name: 'odometer' })
  odometer: string;

  @Column('text', { name: 'nopol' })
  nopol: string;

  @Column('datetime', { name: 'waktu' })
  waktu: Date;

  @Column({ name: 'preset_flag' })
  preset_flag: number;

  @Column({ name: 'complete_flag' })
  complete_flag: number;

  @Column('text', { name: 'respon_subsidi_transaksi' })
  respon_subsidi_transaksi: string;

  @Column('text', { name: 'respon_mypertamina_payment' })
  respon_mypertamina_payment: string;

  @Column('text', { name: 'waktu_kirim' })
  waktu_kirim: string;

  @Column('text', { name: 'no_urut' })
  no_urut: string;
}
