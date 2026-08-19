import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('verifikasi_subsidi_order')
export class EnablerVerifikasiSubsidiOrder {
  @PrimaryColumn({ name: 'no' })
  no: number;

  @Column('text', { name: 'code_value' })
  code_value: string;

  @Column('text', { name: 'verification_type' })
  verification_type: string;

  @Column('text', { name: 'spbu_id' })
  spbu_id: string;

  @Column('text', { name: 'dispenser_id' })
  dispenser_id: string;

  @Column('text', { name: 'produk_bbm' })
  produk_bbm: string;

  @Column({ name: 'order_flag' })
  order_flag: number;

  @Column('text', { name: 'respon_value' })
  respon_value: string;

  @Column({ name: 'respon_flag' })
  respon_flag: number;
}
