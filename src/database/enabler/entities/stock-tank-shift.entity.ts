import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('stock_tank_shift')
export class EnablerStockTankShift {
  @PrimaryGeneratedColumn({ name: 'no' })
  no: number;

  @Column({ name: 'id_tank' })
  id_tank: number;

  @Column({ name: 'id_shift' })
  id_shift: number;

  @Column('text', { name: 'tinggi_minyak_awal' })
  tinggi_minyak_awal: string;

  @Column('text', { name: 'tinggi_minyak_akhir' })
  tinggi_minyak_akhir: string;

  @Column('text', { name: 'volume_minyak_awal' })
  volume_minyak_awal: string;

  @Column('text', { name: 'volume_minyak_akhir' })
  volume_minyak_akhir: string;

  @Column('text', { name: 'tinggi_air_awal' })
  tinggi_air_awal: string;

  @Column('text', { name: 'tinggi_air_akhir' })
  tinggi_air_akhir: string;

  @Column('text', { name: 'volume_air_awal' })
  volume_air_awal: string;

  @Column('text', { name: 'volume_air_akhir' })
  volume_air_akhir: string;

  @Column('datetime', { name: 'waktu_send_server', nullable: true })
  waktu_send_server: Date;

  @Column({ name: 'send_server_flag' })
  send_server_flag: number;
}
