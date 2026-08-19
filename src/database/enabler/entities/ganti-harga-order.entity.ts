import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('ganti_harga_order')
export class EnablerGantiHargaOrder {
  @PrimaryColumn({ name: 'id_produk' })
  id_produk: number;

  @Column('text', { name: 'nama_produk' })
  nama_produk: string;

  @Column('text', { name: 'harga' })
  harga: string;

  @Column('datetime', { name: 'waktu_berlaku' })
  waktu_berlaku: Date;

  @Column('text', { name: 'zona_waktu' })
  zona_waktu: string;

  @Column({ name: 'ganti_harga_flag' })
  ganti_harga_flag: number;
}
