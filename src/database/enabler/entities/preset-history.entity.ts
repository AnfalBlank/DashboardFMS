import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('preset_history')
export class EnablerPresetHistory {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'id_pump' })
  id_pump: number;

  @Column({ name: 'preset_type' })
  preset_type: number;

  @Column('text', { name: 'preset_value' })
  preset_value: string;

  @Column('text', { name: 'product_name' })
  product_name: string;

  @Column('text', { name: 'ip_address' })
  ip_address: string;

  @Column('text', { name: 'user_name' })
  user_name: string;

  @Column('datetime', { name: 'waktu_preset' })
  waktu_preset: Date;

  @Column('datetime', { name: 'waktu_batal' })
  waktu_batal: Date;

  @Column('text', { name: 'keterangan' })
  keterangan: string;

  @Column({ name: 'type_pot' })
  type_pot: number;

  @Column('text', { name: 'card_number_pot' })
  card_number_pot: string;

  @Column('text', { name: 'customer_id_pot' })
  customer_id_pot: string;

  @Column('text', { name: 'customer_name_pot' })
  customer_name_pot: string;

  @Column('text', { name: 'driver_name_pot' })
  driver_name_pot: string;

  @Column('text', { name: 'vehicle_no_pot' })
  vehicle_no_pot: string;

  @Column('text', { name: 'balance_pot' })
  balance_pot: string;

  @Column('text', { name: 'pin_pot' })
  pin_pot: string;

  @Column('text', { name: 'volume_limit_pot' })
  volume_limit_pot: string;

  @Column('text', { name: 'produk_pot' })
  produk_pot: string;

  @Column('text', { name: 'amount_pot' })
  amount_pot: string;

  @Column('text', { name: 'odometer_pot' })
  odometer_pot: string;

  @Column('text', { name: 'vehicle_type_pot' })
  vehicle_type_pot: string;

  @Column('text', { name: 'phone_no_pot' })
  phone_no_pot: string;

  @Column('text', { name: 'agency_name_pot' })
  agency_name_pot: string;

  @Column('text', { name: 'agency_type_pot' })
  agency_type_pot: string;

  @Column('text', { name: 'customer_type_pot' })
  customer_type_pot: string;

  @Column('text', { name: 'payments_pot' })
  payments_pot: string;
}
