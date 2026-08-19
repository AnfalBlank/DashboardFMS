import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('last_tank_data')
export class EnablerLastTankData {
  @PrimaryColumn({ name: 'id_tank' })
  id_tank: number;

  @Column('text', { name: 'tinggi_oil' })
  tinggi_oil: string;

  @Column('text', { name: 'tinggi_air' })
  tinggi_air: string;

  @Column('text', { name: 'temperature' })
  temperature: string;

  @Column('text', { name: 'volume_oil' })
  volume_oil: string;

  @Column('text', { name: 'volume_air' })
  volume_air: string;

  @Column({ name: 'aktif_flag' })
  aktif_flag: number;

  @Column({ name: 'delivery_flag' })
  delivery_flag: number;

  @Column('text', { name: 'probe_status' })
  probe_status: string;

  @Column('text', { name: 'ruang_kosong' })
  ruang_kosong: string;
}
