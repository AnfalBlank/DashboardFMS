import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('ip_server')
export class EnablerIpServer {
  @PrimaryColumn({ name: 'index_ip_server' })
  index_ip_server: number;

  @Column('text', { name: 'ip_server' })
  ip_server: string;

  @Column({ name: 'port_server' })
  port_server: number;
}
