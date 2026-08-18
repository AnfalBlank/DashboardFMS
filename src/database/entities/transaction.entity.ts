import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Card } from './card.entity';
import { Product } from './product.entity';
import { Nozzle } from './nozzle.entity';
import { Pump } from './pump.entity';
import { User } from './user.entity';

@Entity('transactions')
@Index(['cardId'])
@Index(['transactionTime'])
@Index(['status'])
export class Transaction {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string;

  @Column({ name: 'card_id', type: 'varchar', length: 64 })
  cardId: string;

  @ManyToOne(() => Card, (c) => c.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card: Card;

  @Column({ name: 'product_id', type: 'varchar', length: 64 })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'nozzle_id', type: 'varchar', length: 64, nullable: true })
  nozzleId?: string;

  @ManyToOne(() => Nozzle, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'nozzle_id' })
  nozzle?: Nozzle;

  @Column({ name: 'pump_id', type: 'varchar', length: 64, nullable: true })
  pumpId?: string;

  @ManyToOne(() => Pump, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'pump_id' })
  pump?: Pump;

  @Column({ name: 'operator_id', type: 'varchar', length: 64, nullable: true })
  operatorId?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'operator_id' })
  operator?: User;

  @Column({ type: 'varchar', length: 32, default: 'PAGI' })
  shift: 'PAGI' | 'SIANG' | 'MALAM';

  @Column({ name: 'volume_l', type: 'decimal', precision: 12, scale: 2 })
  volumeL: number;

  @Column({ name: 'price_per_unit', type: 'decimal', precision: 12, scale: 2 })
  pricePerUnit: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 14, scale: 2 })
  totalAmount: number;

  @Column({ name: 'totalizer_before', type: 'decimal', precision: 14, scale: 2, nullable: true })
  totalizerBefore?: number;

  @Column({ name: 'totalizer_after', type: 'decimal', precision: 14, scale: 2, nullable: true })
  totalizerAfter?: number;

  @Column({ name: 'quota_before', type: 'decimal', precision: 12, scale: 2, nullable: true })
  quotaBefore?: number;

  @Column({ name: 'quota_deducted', type: 'decimal', precision: 12, scale: 2, nullable: true })
  quotaDeducted?: number;

  @Column({ name: 'quota_after', type: 'decimal', precision: 12, scale: 2, nullable: true })
  quotaAfter?: number;

  @Column({
    type: 'enum',
    enum: ['SUCCESS', 'FAILED', 'CANCELLED', 'VOID', 'REFUNDED', 'PENDING'],
    default: 'SUCCESS',
  })
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'VOID' | 'REFUNDED' | 'PENDING';

  @Column({
    type: 'enum',
    enum: ['CONTROLLER', 'MANUAL', 'API'],
    default: 'MANUAL',
  })
  source: 'CONTROLLER' | 'MANUAL' | 'API';

  @Column({ name: 'void_reason', type: 'text', nullable: true })
  voidReason?: string;

  @Column({ name: 'voided_by', type: 'varchar', length: 64, nullable: true })
  voidedBy?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'voided_by' })
  voider?: User;

  @Column({ name: 'voided_at', type: 'datetime', nullable: true })
  voidedAt?: Date;

  @Column({ name: 'transaction_time', type: 'datetime' })
  transactionTime: Date;

  @Column({ type: 'tinyint', default: 1 })
  synced: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
