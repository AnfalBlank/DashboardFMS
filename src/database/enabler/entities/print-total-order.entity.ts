import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('print_total_order')
export class EnablerPrintTotalOrder {
  @PrimaryColumn({ name: 'no' })
  no: number;

  @Column('text', { name: 'nama_produk' })
  nama_produk: string;

  @Column('text', { name: 'harga_produk' })
  harga_produk: string;

  @Column('text', { name: 'total_volume_awal' })
  total_volume_awal: string;

  @Column('text', { name: 'total_volume_akhir' })
  total_volume_akhir: string;

  @Column('text', { name: 'volume_kotor' })
  volume_kotor: string;

  @Column('text', { name: 'volume_tera' })
  volume_tera: string;

  @Column('text', { name: 'volume_offline' })
  volume_offline: string;

  @Column('text', { name: 'volume_driveoff' })
  volume_driveoff: string;

  @Column('text', { name: 'volume_bersih' })
  volume_bersih: string;

  @Column('text', { name: 'jumlah' })
  jumlah: string;

  @Column('text', { name: 'volume_minyak_awal' })
  volume_minyak_awal: string;

  @Column('text', { name: 'volume_minyak_akhir' })
  volume_minyak_akhir: string;

  @Column('text', { name: 'volume_delivery' })
  volume_delivery: string;

  @Column('text', { name: 'volume_minyak_kotor' })
  volume_minyak_kotor: string;

  @Column('datetime', { name: 'print_time' })
  print_time: Date;

  @Column({ name: 'print_flag' })
  print_flag: number;

  @Column('text', { name: 'open_shift_time' })
  open_shift_time: string;

  @Column('text', { name: 'close_shift_time' })
  close_shift_time: string;
}
