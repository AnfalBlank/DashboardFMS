import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user')
export class EnablerUser {
  @PrimaryGeneratedColumn({ name: 'id_user' })
  id_user: number;

  @Column({ name: 'nama_user' })
  nama_user: string;

  @Column({ name: 'password_user' })
  password_user: string;

  @Column('text', { name: 'status_user' })
  status_user: string;

  @Column('text', { name: 'ip_address' })
  ip_address: string;

  @Column({ name: 'login_flag' })
  login_flag: number;

  @Column({ name: 'aktif_flag' })
  aktif_flag: number;

  @Column('text', { name: 'rfid_number' })
  rfid_number: string;
}
