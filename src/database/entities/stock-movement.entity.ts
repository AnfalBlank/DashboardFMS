import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Tank } from './tank.entity';
import { User } from './user.entity';

@Entity('stock_movements')
export class StockMovement {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string;

  @Column({ name: 'product_id', type: 'varchar', length: 64 })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'tank_id', type: 'varchar', length: 64, nullable: true })
  tankId?: string;

  @ManyToOne(() => Tank, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tank_id' })
  tank?: Tank;

  @Column({
    type: 'enum',
    enum: ['OPENING', 'DELIVERY', 'SALE', 'ADJUSTMENT', 'CLOSING'],
  })
  type: 'OPENING' | 'DELIVERY' | 'SALE' | 'ADJUSTMENT' | 'CLOSING';

  @Column({ name: 'quantity_l', type: 'decimal', precision: 12, scale: 2 })
  quantityL: number;

  @Column({ name: 'balance_l', type: 'decimal', precision: 12, scale: 2 })
  balanceL: number;

  @Column({ name: 'ref_id', type: 'varchar', length: 64, nullable: true })
  refId?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'approved_by', type: 'varchar', length: 64, nullable: true })
  approvedBy?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'approved_by' })
  approver?: User;

  @Column({ name: 'created_by', type: 'varchar', length: 64 })
  createdBy: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
