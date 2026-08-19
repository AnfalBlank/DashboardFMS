import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('ganti_waktu_order')
export class EnablerGantiWaktuOrder {
  @PrimaryColumn({ name: 'no' })
  no: number;

  @Column({ name: 'jam' })
  jam: string;

  @Column({ name: 'menit' })
  menit: string;

  @Column({ name: 'detik' })
  detik: string;

  @Column({ name: 'tahun' })
  tahun: string;

  @Column({ name: 'bulan' })
  bulan: string;

  @Column({ name: 'hari' })
  hari: string;

  @Column({ name: 'ganti_waktu_flag' })
  ganti_waktu_flag: number;
}
