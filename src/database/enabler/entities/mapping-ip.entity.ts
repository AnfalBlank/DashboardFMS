import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('mapping_ip')
export class EnablerMappingIp {
  @PrimaryGeneratedColumn({ name: 'no' })
  no: number;

  @Column({ name: 'index_pump' })
  index_pump: number;

  @Column('text', { name: 'ip_address' })
  ip_address: string;

  @Column({ name: 'aktif_flag' })
  aktif_flag: number;
}
