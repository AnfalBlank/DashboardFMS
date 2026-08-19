import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('self_service_mode')
export class EnablerSelfServiceMode {
  @PrimaryColumn({ name: 'no' })
  no: number;

  @Column({ name: 'index_pump' })
  index_pump: number;

  @Column({ name: 'mode' })
  mode: number;

  @Column({ name: 'timeout' })
  timeout: number;
}
