import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('list_usb')
export class EnablerListUsb {
  @PrimaryColumn({ name: 'no' })
  no: number;

  @Column('text', { name: 'nama_usb' })
  nama_usb: string;
}
