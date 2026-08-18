import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Nozzle } from './nozzle.entity';

@Entity('totalizers')
export class Totalizer {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string;

  @Column({ name: 'nozzle_id', type: 'varchar', length: 64 })
  nozzleId: string;

  @ManyToOne(() => Nozzle, (n) => n.totalizers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nozzle_id' })
  nozzle: Nozzle;

  @Column({ name: 'opening_value', type: 'decimal', precision: 14, scale: 2, default: 0 })
  openingValue: number;

  @Column({ name: 'current_value', type: 'decimal', precision: 14, scale: 2, default: 0 })
  currentValue: number;

  @Column({ name: 'closing_value', type: 'decimal', precision: 14, scale: 2, nullable: true })
  closingValue?: number;

  @Column({ name: 'shift_date', type: 'varchar', length: 32 })
  shiftDate: string;

  @Column({ type: 'varchar', length: 32, default: 'PAGI' })
  shift: 'PAGI' | 'SIANG' | 'MALAM';

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
