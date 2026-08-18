import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { CardQuota } from './card-quota.entity';

@Entity('quota_periods')
@Unique(['year', 'month'])
export class QuotaPeriod {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string;

  @Column({ type: 'varchar', length: 64 })
  period: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'varchar', length: 32, default: 'ACTIVE' })
  status: 'ACTIVE' | 'CLOSED' | 'PENDING';

  @Column({ name: 'closed_at', type: 'datetime', nullable: true })
  closedAt?: Date;

  @Column({ name: 'closed_by', type: 'varchar', length: 64, nullable: true })
  closedBy?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'closed_by' })
  closer?: User;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @OneToMany(() => CardQuota, (cq) => cq.period)
  cardQuotas: CardQuota[];
}
