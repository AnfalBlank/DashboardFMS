import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('reset_order')
export class EnablerResetOrder {
  @PrimaryColumn({ name: 'no' })
  no: number;

  @Column({ name: 'reset_flag' })
  reset_flag: number;

  @Column('datetime', { name: 'waktu' })
  waktu: Date;

  @Column('text', { name: 'user' })
  user: string;
}
