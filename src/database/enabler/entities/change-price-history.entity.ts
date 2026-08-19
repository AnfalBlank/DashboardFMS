import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('change_price_history')
export class EnablerChangePriceHistory {
  @PrimaryGeneratedColumn({ name: 'no' })
  no: number;

  @Column('text', { name: 'nama_produk' })
  nama_produk: string;

  @Column('text', { name: 'old_price' })
  old_price: string;

  @Column('text', { name: 'new_price' })
  new_price: string;

  @Column('datetime', { name: 'change_time' })
  change_time: Date;

  @Column('text', { name: 'user' })
  user: string;
}
