import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('reboot_order')
export class EnablerRebootOrder {
  @PrimaryColumn({ name: 'no' })
  no: number;

  @Column('text', { name: 'user' })
  user: string;

  @Column('datetime', { name: 'waktu' })
  waktu: Date;

  @Column({ name: 'reboot_flag' })
  reboot_flag: number;
}
