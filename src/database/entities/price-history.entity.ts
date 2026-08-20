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

@Entity('price_histories')
export class PriceHistory {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string;

  @Column({ name: 'product_id', type: 'varchar', length: 64 })
  productId: string;

  @ManyToOne(() => Product, (p) => p.priceHistories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'price_per_unit', type: 'decimal', precision: 12, scale: 2 })
  pricePerUnit: number;

  @Column({ name: 'effective_date', type: 'varchar', length: 32 })
  effectiveDate: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason?: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: number;

  @Column({ name: 'created_by', type: 'varchar', length: 64, nullable: true })
  createdBy?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
