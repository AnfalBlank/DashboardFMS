import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Card } from './card.entity';
import { Vehicle } from './vehicle.entity';

@Entity('units')
export class Unit {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ name: 'parent_id', type: 'varchar', length: 64, nullable: true })
  parentId?: string;

  @ManyToOne(() => Unit, (unit) => unit.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent?: Unit;

  @OneToMany(() => Unit, (unit) => unit.parent)
  children: Unit[];

  @Column({ type: 'varchar', length: 128, nullable: true })
  commander?: string;

  @Column({ type: 'varchar', length: 32, default: 'ACTIVE' })
  status: string;

  @Column({ name: 'default_alloc_l', type: 'decimal', precision: 12, scale: 2, default: 200 })
  defaultAllocL: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @OneToMany(() => User, (user) => user.unit)
  users: User[];

  @OneToMany(() => Card, (card) => card.unit)
  cards: Card[];

  @OneToMany(() => Vehicle, (veh) => veh.unit)
  vehicles: Vehicle[];
}
