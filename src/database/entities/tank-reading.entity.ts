import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tank } from './tank.entity';
import { User } from './user.entity';

@Entity('tank_readings')
export class TankReading {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string;

  @Column({ name: 'tank_id', type: 'varchar', length: 64 })
  tankId: string;

  @ManyToOne(() => Tank, (t) => t.readings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tank_id' })
  tank: Tank;

  @Column({ name: 'volume_l', type: 'decimal', precision: 12, scale: 2 })
  volumeL: number;

  @Column({ name: 'height_cm', type: 'decimal', precision: 8, scale: 2, nullable: true })
  heightCm?: number;

  @Column({ name: 'water_level', type: 'decimal', precision: 8, scale: 2, nullable: true })
  waterLevel?: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  temperature?: number;

  @Column({ type: 'varchar', length: 32, default: 'SENSOR' })
  source: 'SENSOR' | 'MANUAL';

  @Column({ name: 'read_at', type: 'datetime' })
  readAt: Date;

  @Column({ name: 'created_by', type: 'varchar', length: 64, nullable: true })
  createdBy?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
