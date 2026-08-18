import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { Pump } from './pump.entity';
import { Product } from './product.entity';
import { Totalizer } from './totalizer.entity';

@Entity('nozzles')
@Unique(['pumpId', 'number'])
export class Nozzle {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string;

  @Column({ type: 'varchar', length: 64 })
  number: string;

  @Column({ name: 'pump_id', type: 'varchar', length: 64 })
  pumpId: string;

  @ManyToOne(() => Pump, (p) => p.nozzles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pump_id' })
  pump: Pump;

  @Column({ name: 'product_id', type: 'varchar', length: 64 })
  productId: string;

  @ManyToOne(() => Product, (prod) => prod.nozzles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'varchar', length: 32, default: 'ACTIVE' })
  status: 'ACTIVE' | 'INACTIVE' | 'OFFLINE';

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @OneToMany(() => Totalizer, (t) => t.nozzle)
  totalizers: Totalizer[];
}
