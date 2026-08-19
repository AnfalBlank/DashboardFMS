import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('header')
export class EnablerHeader {
  @PrimaryColumn({ name: 'id_header' })
  id_header: number;

  @Column('text', { name: 'text_header' })
  text_header: string;
}
