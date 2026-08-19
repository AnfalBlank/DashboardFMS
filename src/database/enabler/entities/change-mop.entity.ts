import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('change_mop')
export class EnablerChangeMop {
  @PrimaryColumn({ name: 'no_urut' })
  no_urut: number;

  @Column({ name: 'id_pump' })
  id_pump: number;

  @Column({ name: 'id_nozzle' })
  id_nozzle: number;

  @Column({ name: 'id_attendant' })
  id_attendant: number;

  @Column('text', { name: 'odometer' })
  odometer: string;

  @Column({ name: 'vehicle_no' })
  vehicle_no: number;

  @Column('text', { name: 'vehicle_type' })
  vehicle_type: string;

  @Column('text', { name: 'phone_no' })
  phone_no: string;

  @Column('text', { name: 'agency_name' })
  agency_name: string;

  @Column('text', { name: 'agency_type' })
  agency_type: string;

  @Column('text', { name: 'customer_type' })
  customer_type: string;

  @Column('text', { name: 'type_payment' })
  type_payment: string;

  @Column('text', { name: 'name_payment' })
  name_payment: string;

  @Column('text', { name: 'amount_payment' })
  amount_payment: string;

  @Column('text', { name: 'ref_no_payment' })
  ref_no_payment: string;

  @Column('text', { name: 'verify_no_payment' })
  verify_no_payment: string;

  @Column('text', { name: 'terminal_id_payment' })
  terminal_id_payment: string;

  @Column('text', { name: 'payments_json' })
  payments_json: string;
}
