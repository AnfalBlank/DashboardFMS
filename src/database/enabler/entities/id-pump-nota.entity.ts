import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('id_pump_nota')
export class EnablerIdPumpNota {
  @PrimaryColumn({ name: 'index_pump' })
  index_pump: number;

  @Column({ name: 'id_pump_nota' })
  id_pump_nota: number;
}
