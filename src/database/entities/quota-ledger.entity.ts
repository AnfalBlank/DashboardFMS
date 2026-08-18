import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CardQuota } from './card-quota.entity';
import { Card } from './card.entity';
import { User } from './user.entity';

@Entity('quota_ledger')
export class QuotaLedger {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string;

  @Column({ name: 'quota_id', type: 'varchar', length: 64 })
  quotaId: string;

  @ManyToOne(() => CardQuota, (cq) => cq.ledgerEntries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quota_id' })
  quota: CardQuota;

  @Column({ name: 'card_id', type: 'varchar', length: 64 })
  cardId: string;

  @ManyToOne(() => Card, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card: Card;

  @Column({
    type: 'enum',
    enum: ['ALLOCATION', 'DEDUCTION', 'TOPUP', 'EXPIRATION', 'REVERSAL'],
  })
  type: 'ALLOCATION' | 'DEDUCTION' | 'TOPUP' | 'EXPIRATION' | 'REVERSAL';

  @Column({ name: 'amount_l', type: 'decimal', precision: 12, scale: 2 })
  amountL: number;

  @Column({ name: 'balance_l', type: 'decimal', precision: 12, scale: 2 })
  balanceL: number;

  @Column({ name: 'ref_id', type: 'varchar', length: 64, nullable: true })
  refId?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'created_by', type: 'varchar', length: 64, nullable: true })
  createdBy?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
