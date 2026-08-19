import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('setting_tank')
export class EnablerSettingTank {
  @PrimaryColumn({ name: 'id_tank' })
  id_tank: number;

  @Column('text', { name: 'volume_max' })
  volume_max: string;

  @Column('text', { name: 'tinggi_max' })
  tinggi_max: string;

  @Column('text', { name: 'warna_oil' })
  warna_oil: string;

  @Column('text', { name: 'warna_air' })
  warna_air: string;

  @Column('text', { name: 'tank_product' })
  tank_product: string;

  @Column({ name: 'aktif_flag' })
  aktif_flag: number;

  @Column('text', { name: 'koreksi_minyak' })
  koreksi_minyak: string;

  @Column('text', { name: 'koreksi_air' })
  koreksi_air: string;

  @Column('text', { name: 'id_atg' })
  id_atg: string;

  @Column('text', { name: 'number_tank' })
  number_tank: string;

  @Column('text', { name: 'name_tank' })
  name_tank: string;

  @Column({ name: 'set_id_flag' })
  set_id_flag: number;

  @Column({ name: 'id_port' })
  id_port: number;

  @Column({ name: 'id_polling' })
  id_polling: number;
}
