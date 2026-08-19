import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('setting_port')
export class EnablerSettingPort {
  @PrimaryColumn({ name: 'no' })
  no: number;

  @Column('text', { name: 'port_com' })
  port_com: string;

  @Column('text', { name: 'keterangan' })
  keterangan: string;

  @Column({ name: 'aktif_flag' })
  aktif_flag: number;
}
