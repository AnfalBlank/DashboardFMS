import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('shift_history')
export class EnablerShiftHistory {
  @PrimaryColumn({ name: 'id_shift' })
  id_shift: number;

  @Column('datetime', { name: 'open_shift_time' })
  open_shift_time: Date;

  @Column('datetime', { name: 'close_shift_time' })
  close_shift_time: Date;

  @Column('text', { name: 'total_amount_awal' })
  total_amount_awal: string;

  @Column('text', { name: 'total_amount_akhir' })
  total_amount_akhir: string;

  @Column('text', { name: 'total_volume_awal' })
  total_volume_awal: string;

  @Column('text', { name: 'total_volume_akhir' })
  total_volume_akhir: string;

  @Column('text', { name: 'tinggi_tank_awal' })
  tinggi_tank_awal: string;

  @Column('text', { name: 'tinggi_tank_akhir' })
  tinggi_tank_akhir: string;

  @Column('text', { name: 'volume_tank_awal' })
  volume_tank_awal: string;

  @Column('text', { name: 'volume_tank_akhir' })
  volume_tank_akhir: string;

  @Column({ name: 'open_shift_flag' })
  open_shift_flag: number;

  @Column('text', { name: 'waktu_send_server' })
  waktu_send_server: string;

  @Column({ name: 'send_server_flag' })
  send_server_flag: number;
}
