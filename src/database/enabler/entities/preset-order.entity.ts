import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('preset_order')
export class EnablerPresetOrder {
  @PrimaryColumn({ name: 'id_pump' })
  id_pump: number;

  @Column({ name: 'preset_type' })
  preset_type: number;

  @Column('text', { name: 'preset_value' })
  preset_value: string;

  @Column('text', { name: 'product_name' })
  product_name: string;

  @Column('text', { name: 'barcode' })
  barcode: string;

  @Column('text', { name: 'preset_time' })
  preset_time: string;

  @Column({ name: 'preset_flag' })
  preset_flag: number;

  @Column('text', { name: 'id_preset' })
  id_preset: string;
}
