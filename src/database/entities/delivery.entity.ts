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

@Entity('deliveries')
export class Delivery {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string;

  @Column({ type: 'varchar', length: 32 })
  date: string;

  @Column({ type: 'varchar', length: 128 })
  supplier: string;

  @Column({ name: 'product_id', type: 'varchar', length: 64 })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'quantity_l', type: 'decimal', precision: 12, scale: 2 })
  quantityL: number;

  @Column({ name: 'tank_id', type: 'varchar', length: 64, nullable: true })
  tankId?: string;

  @ManyToOne(() => Tank, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tank_id' })
  tank?: Tank;

  @Column({ name: 'doc_number', type: 'varchar', length: 128, nullable: true })
  docNumber?: string;

  @Column({ name: 'delivery_note', type: 'text', nullable: true })
  deliveryNote?: string;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
    default: 'PENDING',
  })
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';

  @Column({ name: 'confirmed_by', type: 'varchar', length: 64, nullable: true })
  confirmedBy?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'confirmed_by' })
  confirmer?: User;

  @Column({ name: 'confirmed_at', type: 'datetime', nullable: true })
  confirmedAt?: Date;

  @Column({ name: 'created_by', type: 'varchar', length: 64 })
  createdBy: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
