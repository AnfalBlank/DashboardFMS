import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('scanner_address')
export class EnablerScannerAddress {
  @PrimaryColumn({ name: 'id_pump' })
  id_pump: number;

  @Column('text', { name: 'ip_scanner' })
  ip_scanner: string;
}
