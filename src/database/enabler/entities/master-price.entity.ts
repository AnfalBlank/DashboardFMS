import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('master_price')
export class EnablerMasterPrice {
  @PrimaryColumn({ name: 'no' })
  no: number;

  @Column({ name: 'master_price_enable' })
  master_price_enable: number;
}
