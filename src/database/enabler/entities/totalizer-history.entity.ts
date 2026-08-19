import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('totalizer_history')
export class EnablerTotalizerHistory {
  @PrimaryColumn({ name: 'index_pump' })
  index_pump: number;

  @PrimaryColumn({ name: 'index_nozzle' })
  index_nozzle: number;

  @PrimaryColumn({ name: 'id_shift' })
  id_shift: number;

  @Column('text', { name: 'total_volume_awal' })
  total_volume_awal: string;

  @Column('text', { name: 'total_volume_akhir' })
  total_volume_akhir: string;

  @Column('text', { name: 'total_amount_awal' })
  total_amount_awal: string;

  @Column('text', { name: 'total_amount_akhir' })
  total_amount_akhir: string;
}
