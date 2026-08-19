import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('extended_digit_mode')
export class EnablerExtendedDigitMode {
  @PrimaryColumn({ name: 'id_edm' })
  id_edm: number;

  @Column({ name: 'index_pump' })
  index_pump: number;

  @Column({ name: 'ext_digit_flag' })
  ext_digit_flag: number;
}
