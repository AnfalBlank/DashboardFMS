import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tank_delivery')
export class EnablerTankDelivery {
  @PrimaryGeneratedColumn({ name: 'no' })
  no: number;

  @Column({ name: 'id_tank' })
  id_tank: number;

  @Column('text', { name: 'id_shift', nullable: true })
  id_shift: string;

  @Column('text', { name: 'volume_minyak_awal' })
  volume_minyak_awal: string;

  @Column('text', { name: 'volume_minyak_akhir' })
  volume_minyak_akhir: string;

  @Column('text', { name: 'tinggi_minyak_awal', nullable: true })
  tinggi_minyak_awal: string;

  @Column('text', { name: 'tinggi_minyak_akhir', nullable: true })
  tinggi_minyak_akhir: string;

  @Column('text', { name: 'volume_air_awal', nullable: true })
  volume_air_awal: string;

  @Column('text', { name: 'volume_air_akhir', nullable: true })
  volume_air_akhir: string;

  @Column('text', { name: 'tinggi_air_awal', nullable: true })
  tinggi_air_awal: string;

  @Column('text', { name: 'tinggi_air_akhir', nullable: true })
  tinggi_air_akhir: string;

  @Column('text', { name: 'waktu_mulai_delivery', nullable: true })
  waktu_mulai_delivery: string;

  @Column('text', { name: 'waktu_selesai_delivery', nullable: true })
  waktu_selesai_delivery: string;

  @Column('text', { name: 'volume_permintaan', nullable: true })
  volume_permintaan: string;

  @Column('text', { name: 'no_do', nullable: true })
  no_do: string;

  @Column('text', { name: 'no_invoice', nullable: true })
  no_invoice: string;

  @Column('text', { name: 'no_kendaraan', nullable: true })
  no_kendaraan: string;

  @Column('text', { name: 'nama_pengemudi', nullable: true })
  nama_pengemudi: string;

  @Column('text', { name: 'pengirim', nullable: true })
  pengirim: string;

  @Column({ name: 'delivery_flag' })
  delivery_flag: number;

  @Column('text', { name: 'waktu_send_server', nullable: true })
  waktu_send_server: string;

  @Column({ name: 'send_server_flag' })
  send_server_flag: number;
}
