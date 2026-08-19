import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('link_server')
export class EnablerLinkServer {
  @PrimaryColumn({ name: 'no' })
  no: number;

  @Column('text', { name: 'link' })
  link: string;

  @Column('text', { name: 'keterangan' })
  keterangan: string;
}
