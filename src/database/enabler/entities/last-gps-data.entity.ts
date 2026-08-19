import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('last_gps_data')
export class EnablerLastGpsData {
  @PrimaryGeneratedColumn({ name: 'no' })
  no: number;

  @Column('text', { name: 'latitude' })
  latitude: string;

  @Column('text', { name: 'longitude' })
  longitude: string;

  @Column('text', { name: 'speed' })
  speed: string;

  @Column('text', { name: 'date_stamp' })
  date_stamp: string;

  @Column('text', { name: 'time_stamp' })
  time_stamp: string;

  @Column('datetime', { name: 'waktu_kirim' })
  waktu_kirim: Date;

  @Column({ name: 'send_server_flag' })
  send_server_flag: number;
}
