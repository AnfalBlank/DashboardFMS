import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Product } from './product.entity';
import { TankReading } from './tank-reading.entity';

@Entity('tanks')
export class Tank {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string;

  @Column({ name: 'product_id', type: 'varchar', length: 64 })
  productId: string;

  @ManyToOne(() => Product, (p) => p.tanks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'capacity_l', type: 'decimal', precision: 12, scale: 2 })
  capacityL: number;

  @Column({ name: 'current_l', type: 'decimal', precision: 12, scale: 2, default: 0 })
  currentL: number;

  @Column({ type: 'varchar', length: 32, default: 'NORMAL' })
  status: 'NORMAL' | 'LOW' | 'CRITICAL' | 'HIGH' | 'SENSOR_ERROR' | 'OFFLINE';

  @Column({ name: 'oil_color', type: 'varchar', length: 32, default: 'blue' })
  oilColor: 'blue' | 'green' | 'red' | 'yellow';

  @Column({ name: 'water_color', type: 'varchar', length: 32, default: 'blue' })
  waterColor: 'blue' | 'yellow';

  @Column({ type: 'tinyint', default: 1 })
  active: number;

  @Column({ name: 'id_port', type: 'int', nullable: true })
  idPort?: number;

  @Column({ name: 'id_polling', type: 'int', nullable: true })
  idPolling?: number;

  @Column({ name: 'id_tank_enabler', type: 'int', nullable: true })
  idTankEnabler?: number;

  @Column({ name: 'threshold_low', type: 'decimal', precision: 5, scale: 2, default: 30 })
  thresholdLow: number;

  @Column({ name: 'threshold_critical', type: 'decimal', precision: 5, scale: 2, default: 15 })
  thresholdCritical: number;

  @Column({ name: 'threshold_high', type: 'decimal', precision: 5, scale: 2, default: 90 })
  thresholdHigh: number;

  @Column({ name: 'last_reading_at', type: 'datetime', nullable: true })
  lastReadingAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @OneToMany(() => TankReading, (tr) => tr.tank)
  readings: TankReading[];
}
