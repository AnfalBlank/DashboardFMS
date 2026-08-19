import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('totalizer_shift')
export class EnablerTotalizerShift {
  @PrimaryGeneratedColumn({ name: 'no' })
  no: number;

  @Column({ name: 'index_pump' })
  index_pump: number;

  @Column({ name: 'index_nozzle' })
  index_nozzle: number;

  @Column({ name: 'id_shift' })
  id_shift: number;

  @Column('text', { name: 'total_amount_awal' })
  total_amount_awal: string;

  @Column('text', { name: 'total_amount_akhir' })
  total_amount_akhir: string;

  @Column('text', { name: 'total_volume_awal' })
  total_volume_awal: string;

  @Column('text', { name: 'total_volume_akhir' })
  total_volume_akhir: string;

  @Column('datetime', { name: 'waktu_send_server', nullable: true })
  waktu_send_server: Date;

  @Column({ name: 'send_server_flag' })
  send_server_flag: number;
}
