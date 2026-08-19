import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tera_order')
export class EnablerTeraOrder {
  @PrimaryColumn({ name: 'id_pump' })
  id_pump: number;

  @Column('text', { name: 'product_name' })
  product_name: string;

  @Column('datetime', { name: 'tera_time' })
  tera_time: Date;

  @Column({ name: 'tera_flag' })
  tera_flag: number;
}
