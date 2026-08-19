import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('password')
export class EnablerPassword {
  @PrimaryColumn({ name: 'id_password' })
  id_password: number;

  @Column('text', { name: 'password_text' })
  password_text: string;

  @Column('text', { name: 'keterangan' })
  keterangan: string;
}
