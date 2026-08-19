import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('login_history')
export class EnablerLoginHistory {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column('text', { name: 'ip_address' })
  ip_address: string;

  @Column('text', { name: 'user_name' })
  user_name: string;

  @Column('datetime', { name: 'waktu' })
  waktu: Date;

  @Column('text', { name: 'keterangan' })
  keterangan: string;
}
