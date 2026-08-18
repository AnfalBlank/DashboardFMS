import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Unit } from './unit.entity';
import { Card } from './card.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string;

  @Column({ name: 'police_number', type: 'varchar', length: 64, unique: true })
  policeNumber: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  type?: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  brand?: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  model?: string;

  @Column({ type: 'int', nullable: true })
  year?: number;

  @Column({ name: 'unit_id', type: 'varchar', length: 64, nullable: true })
  unitId?: string;

  @ManyToOne(() => Unit, (unit) => unit.vehicles, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'unit_id' })
  unit?: Unit;

  @Column({ name: 'fuel_type', type: 'varchar', length: 64, nullable: true })
  fuelType?: string;

  @Column({ type: 'varchar', length: 32, default: 'ACTIVE' })
  status: 'ACTIVE' | 'INACTIVE';

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @OneToMany(() => Card, (card) => card.vehicle)
  cards: Card[];
}
