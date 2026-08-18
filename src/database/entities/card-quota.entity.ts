import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { Card } from './card.entity';
import { QuotaPeriod } from './quota-period.entity';
import { Product } from './product.entity';
import { QuotaLedger } from './quota-ledger.entity';

@Entity('card_quotas')
@Unique(['cardId', 'periodId', 'productId'])
export class CardQuota {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string;

  @Column({ name: 'card_id', type: 'varchar', length: 64 })
  cardId: string;

  @ManyToOne(() => Card, (c) => c.quotas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card: Card;

  @Column({ name: 'period_id', type: 'varchar', length: 64 })
  periodId: string;

  @ManyToOne(() => QuotaPeriod, (qp) => qp.cardQuotas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'period_id' })
  period: QuotaPeriod;

  @Column({ name: 'product_id', type: 'varchar', length: 64 })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'allocated_l', type: 'decimal', precision: 12, scale: 2, default: 0 })
  allocatedL: number;

  @Column({ name: 'used_l', type: 'decimal', precision: 12, scale: 2, default: 0 })
  usedL: number;

  @Column({ name: 'remaining_l', type: 'decimal', precision: 12, scale: 2, default: 0 })
  remainingL: number;

  @Column({ name: 'topup_l', type: 'decimal', precision: 12, scale: 2, default: 0 })
  topupL: number;

  @Column({ name: 'expired_l', type: 'decimal', precision: 12, scale: 2, default: 0 })
  expiredL: number;

  @Column({ type: 'varchar', length: 32, default: 'ACTIVE' })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @OneToMany(() => QuotaLedger, (ql) => ql.quota)
  ledgerEntries: QuotaLedger[];
}
