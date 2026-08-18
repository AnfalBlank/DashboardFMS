import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('audit_logs')
@Index(['userId'])
@Index(['module'])
export class AuditLog {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 64, nullable: true })
  userId?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'varchar', length: 64 })
  action: string;

  @Column({ type: 'varchar', length: 64 })
  module: string;

  @Column({ name: 'record_id', type: 'varchar', length: 64, nullable: true })
  recordId?: string;

  @Column({ name: 'before_val', type: 'longtext', nullable: true })
  beforeVal?: string;

  @Column({ name: 'after_val', type: 'longtext', nullable: true })
  afterVal?: string;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 64, nullable: true })
  ipAddress?: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
