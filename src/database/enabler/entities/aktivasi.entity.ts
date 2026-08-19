import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('aktivasi')
export class EnablerAktivasi {
  @PrimaryColumn({ name: 'no' })
  no: number;

  @Column('text', { name: 'serial_number' })
  serial_number: string;

  @Column('text', { name: 'key_aktivasi' })
  key_aktivasi: string;

  @Column({ name: 'status' })
  status: number;
}
