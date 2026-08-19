import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('pid_aplication')
export class EnablerPidAplication {
  @PrimaryColumn({ name: 'no' })
  no: number;

  @Column('text', { name: 'pid_number' })
  pid_number: string;

  @Column('text', { name: 'start_time' })
  start_time: string;

  @Column('text', { name: 'keterangan' })
  keterangan: string;
}
