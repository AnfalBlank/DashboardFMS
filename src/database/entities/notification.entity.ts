import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string;

  @Column({
    type: 'enum',
    enum: ['CRITICAL', 'WARNING', 'INFO'],
    default: 'INFO',
  })
  type: 'CRITICAL' | 'WARNING' | 'INFO';

  @Column({ type: 'varchar', length: 128 })
  title: string;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  module?: string;

  @Column({ name: 'ref_id', type: 'varchar', length: 64, nullable: true })
  refId?: string;

  @Column({ type: 'tinyint', default: 0 })
  read: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
