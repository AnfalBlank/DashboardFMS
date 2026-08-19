import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('restart_server_order')
export class EnablerRestartServerOrder {
  @PrimaryColumn({ name: 'no' })
  no: number;

  @Column('text', { name: 'user' })
  user: string;

  @Column('datetime', { name: 'waktu_restart' })
  waktu_restart: Date;

  @Column({ name: 'restart_port1_flag' })
  restart_port1_flag: number;

  @Column({ name: 'restart_port2_flag' })
  restart_port2_flag: number;

  @Column({ name: 'restart_checker_flag' })
  restart_checker_flag: number;

  @Column({ name: 'restart_send2server_flag' })
  restart_send2server_flag: number;

  @Column({ name: 'restart_flag' })
  restart_flag: number;

  @Column('text', { name: 'keterangan' })
  keterangan: string;
}
