import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { User } from './user.entity';

@Entity('reconciliations')
export class Reconciliation {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string;

  @Column({ name: 'product_id', type: 'varchar', length: 64 })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'varchar', length: 32 })
  date: string;

  @Column({ name: 'opening_l', type: 'decimal', precision: 12, scale: 2, default: 0 })
  openingL: number;

  @Column({ name: 'delivery_l', type: 'decimal', precision: 12, scale: 2, default: 0 })
  deliveryL: number;

  @Column({ name: 'sales_l', type: 'decimal', precision: 12, scale: 2, default: 0 })
  salesL: number;

  @Column({ name: 'adjustment_l', type: 'decimal', precision: 12, scale: 2, default: 0 })
  adjustmentL: number;

  @Column({ name: 'theoretical_closing', type: 'decimal', precision: 12, scale: 2, default: 0 })
  theoreticalClosing: number;

  @Column({ name: 'actual_closing', type: 'decimal', precision: 12, scale: 2, default: 0 })
  actualClosing: number;

  @Column({ name: 'variance_l', type: 'decimal', precision: 12, scale: 2, default: 0 })
  varianceL: number;

  @Column({ name: 'variance_pct', type: 'decimal', precision: 8, scale: 2, default: 0 })
  variancePct: number;

  @Column({
    type: 'enum',
    enum: ['PERFECT', 'NORMAL', 'WARNING', 'CRITICAL'],
    default: 'NORMAL',
  })
  status: 'PERFECT' | 'NORMAL' | 'WARNING' | 'CRITICAL';

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'created_by', type: 'varchar', length: 64, nullable: true })
  createdBy?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
