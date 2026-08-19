import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('setting_produk')
export class EnablerSettingProduk {
  @PrimaryColumn({ name: 'id_produk' })
  id_produk: number;

  @Column('text', { name: 'nama_produk' })
  nama_produk: string;

  @Column('text', { name: 'harga_produk' })
  harga_produk: string;

  @Column('text', { name: 'status' })
  status: string;

  @Column('text', { name: 'code_produk' })
  code_produk: string;
}
