import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Nozzle } from './nozzle.entity';

@Entity('pumps')
export class Pump {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  number: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  location?: string;

  @Column({ type: 'varchar', length: 32, default: 'ACTIVE' })
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'OFFLINE';

  @Column({ type: 'tinyint', default: 1 })
  active: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @OneToMany(() => Nozzle, (n) => n.pump)
  nozzles: Nozzle[];
}
