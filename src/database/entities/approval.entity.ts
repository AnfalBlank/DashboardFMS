import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('approvals')
export class Approval {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string;

  @Column({ type: 'varchar', length: 64 })
  type: string;

  @Column({ name: 'ref_table', type: 'varchar', length: 64 })
  refTable: string;

  @Column({ name: 'ref_id', type: 'varchar', length: 64 })
  refId: string;

  @Column({ type: 'text', nullable: true })
  detail?: string;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  })
  status: 'PENDING' | 'APPROVED' | 'REJECTED';

  @Column({ name: 'requested_by', type: 'varchar', length: 64 })
  requestedBy: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requested_by' })
  requester: User;

  @Column({ name: 'reviewed_by', type: 'varchar', length: 64, nullable: true })
  reviewedBy?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer?: User;

  @Column({ name: 'review_note', type: 'text', nullable: true })
  reviewNote?: string;

  @CreateDateColumn({ name: 'requested_at', type: 'datetime' })
  requestedAt: Date;

  @Column({ name: 'reviewed_at', type: 'datetime', nullable: true })
  reviewedAt?: Date;
}
