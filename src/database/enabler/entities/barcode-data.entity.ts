import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('barcode_data')
export class EnablerBarcodeData {
  @PrimaryColumn({ name: 'barcode' })
  barcode: string;

  @Column({ name: 'id_pump' })
  id_pump: number;

  @Column({ name: 'jumlah_nozzle' })
  jumlah_nozzle: number;

  @Column('text', { name: 'product_name' })
  product_name: string;

  @Column({ name: 'preset_type' })
  preset_type: number;

  @Column('text', { name: 'preset_value' })
  preset_value: string;

  @Column({ name: 'status' })
  status: number;

  @Column({ name: 'nozzle_up' })
  nozzle_up: number;

  @Column({ name: 'fueling' })
  fueling: number;

  @Column({ name: 'complete' })
  complete: number;

  @Column('text', { name: 'keterangan' })
  keterangan: string;
}
