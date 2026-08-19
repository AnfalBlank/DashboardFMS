import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('last_status_pump')
export class EnablerLastStatusPump {
  @PrimaryColumn({ name: 'index_pump' })
  index_pump: number;

  @Column({ name: 'pump_idle' })
  pump_idle: number;

  @Column({ name: 'pump_nozzleup' })
  pump_nozzleup: number;

  @Column({ name: 'pump_fueling' })
  pump_fueling: number;

  @Column({ name: 'pump_complete' })
  pump_complete: number;

  @Column({ name: 'pump_connected' })
  pump_connected: number;
}
