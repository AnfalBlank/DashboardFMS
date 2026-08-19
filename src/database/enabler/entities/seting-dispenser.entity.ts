import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('seting_dispenser')
export class EnablerSetingDispenser {
  @PrimaryColumn({ name: 'id_dispenser' })
  id_dispenser: number;

  @Column({ name: 'jumlah_pump', nullable: true })
  jumlah_pump: number;

  @Column({ name: 'jumlah_nozzle_pump1', nullable: true })
  jumlah_nozzle_pump1: number;

  @Column({ name: 'jumlah_nozzle_pump2', nullable: true })
  jumlah_nozzle_pump2: number;

  @Column({ name: 'jumlah_nozzle_pump3', nullable: true })
  jumlah_nozzle_pump3: number;

  @Column({ name: 'jumlah_nozzle_pump4', nullable: true })
  jumlah_nozzle_pump4: number;

  @Column({ name: 'jumlah_nozzle_pump5' })
  jumlah_nozzle_pump5: number;

  @Column({ name: 'jumlah_nozzle_pump6' })
  jumlah_nozzle_pump6: number;

  @Column({ name: 'jumlah_nozzle_pump7' })
  jumlah_nozzle_pump7: number;

  @Column({ name: 'jumlah_nozzle_pump8' })
  jumlah_nozzle_pump8: number;

  @Column({ name: 'jumlah_nozzle_pump9' })
  jumlah_nozzle_pump9: number;

  @Column({ name: 'jumlah_nozzle_pump10' })
  jumlah_nozzle_pump10: number;

  @Column({ name: 'id_awal', nullable: true })
  id_awal: number;

  @Column('text', { name: 'auth_pump1_flag' })
  auth_pump1_flag: string;

  @Column('text', { name: 'auth_pump2_flag' })
  auth_pump2_flag: string;

  @Column('text', { name: 'auth_pump3_flag' })
  auth_pump3_flag: string;

  @Column('text', { name: 'auth_pump4_flag' })
  auth_pump4_flag: string;

  @Column('text', { name: 'auth_pump5_flag' })
  auth_pump5_flag: string;

  @Column('text', { name: 'auth_pump6_flag' })
  auth_pump6_flag: string;

  @Column('text', { name: 'auth_pump7_flag' })
  auth_pump7_flag: string;

  @Column('text', { name: 'auth_pump8_flag' })
  auth_pump8_flag: string;

  @Column('text', { name: 'auth_pump9_flag' })
  auth_pump9_flag: string;

  @Column('text', { name: 'auth_pump10_flag' })
  auth_pump10_flag: string;

  @Column({ name: 'id_pump1' })
  id_pump1: number;

  @Column({ name: 'id_pump2' })
  id_pump2: number;

  @Column({ name: 'id_pump3' })
  id_pump3: number;

  @Column({ name: 'id_pump4' })
  id_pump4: number;

  @Column({ name: 'id_pump5' })
  id_pump5: number;

  @Column({ name: 'id_pump6' })
  id_pump6: number;

  @Column({ name: 'id_pump7' })
  id_pump7: number;

  @Column({ name: 'id_pump8' })
  id_pump8: number;

  @Column({ name: 'id_pump9' })
  id_pump9: number;

  @Column({ name: 'id_pump10' })
  id_pump10: number;

  @Column('text', { name: 'name_pump1' })
  name_pump1: string;

  @Column('text', { name: 'name_pump2' })
  name_pump2: string;

  @Column('text', { name: 'name_pump3' })
  name_pump3: string;

  @Column('text', { name: 'name_pump4' })
  name_pump4: string;

  @Column('text', { name: 'name_pump5' })
  name_pump5: string;

  @Column('text', { name: 'name_pump6' })
  name_pump6: string;

  @Column('text', { name: 'name_pump7' })
  name_pump7: string;

  @Column('text', { name: 'name_pump8' })
  name_pump8: string;

  @Column('text', { name: 'name_pump9' })
  name_pump9: string;

  @Column('text', { name: 'name_pump10' })
  name_pump10: string;
}
