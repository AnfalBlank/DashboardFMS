import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('qr_payment_order')
export class EnablerQrPaymentOrder {
  @PrimaryColumn({ name: 'id_pump' })
  id_pump: number;

  @Column('datetime', { name: 'waktu' })
  waktu: Date;

  @Column('text', { name: 'amount' })
  amount: string;

  @Column('text', { name: 'produk' })
  produk: string;

  @Column('text', { name: 'volume' })
  volume: string;

  @Column('text', { name: 'id_spbu' })
  id_spbu: string;

  @Column('text', { name: 'tid' })
  tid: string;

  @Column('text', { name: 'mid' })
  mid: string;

  @Column({ name: 'order_flag' })
  order_flag: number;

  @Column({ name: 'respon_flag' })
  respon_flag: number;

  @Column('text', { name: 'respon_value', nullable: true })
  respon_value: string;

  @Column('text', { name: 'message_respon' })
  message_respon: string;

  @Column('text', { name: 'mid_respon' })
  mid_respon: string;

  @Column('text', { name: 'tid_respon' })
  tid_respon: string;

  @Column('text', { name: 'transaction_id_respon' })
  transaction_id_respon: string;

  @Column('text', { name: 'sof_respon' })
  sof_respon: string;

  @Column('text', { name: 'rc_respon' })
  rc_respon: string;

  @Column('text', { name: 'qr_content_respon' })
  qr_content_respon: string;

  @Column({ name: 'scan_status_flag' })
  scan_status_flag: number;

  @Column('text', { name: 'scan_status' })
  scan_status: string;
}
