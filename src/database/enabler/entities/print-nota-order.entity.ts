import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('print_nota_order')
export class EnablerPrintNotaOrder {
  @PrimaryColumn({ name: 'no' })
  no: number;

  @Column('text', { name: 'no_urut' })
  no_urut: string;

  @Column('text', { name: 'waktu_print' })
  waktu_print: string;

  @Column({ name: 'print_flag' })
  print_flag: number;

  @Column('text', { name: 'odometer' })
  odometer: string;

  @Column('text', { name: 'nopol' })
  nopol: string;
}
