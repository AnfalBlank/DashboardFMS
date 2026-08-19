import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('setting_pump')
export class EnablerSettingPump {
  @PrimaryColumn({ name: 'id_pump' })
  id_pump: number;

  @Column({ name: 'number_pump' })
  number_pump: number;

  @Column('text', { name: 'name_pump' })
  name_pump: string;

  @Column({ name: 'auth_flag' })
  auth_flag: number;

  @Column({ name: 'number_of_nozzle' })
  number_of_nozzle: number;

  @Column('text', { name: 'port_number' })
  port_number: string;

  @Column({ name: 'auth_by_card_flag' })
  auth_by_card_flag: number;

  @Column({ name: 'aktif_flag' })
  aktif_flag: number;

  @Column({ name: 'id_polling' })
  id_polling: number;
}
