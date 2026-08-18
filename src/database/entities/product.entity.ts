import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { PriceHistory } from './price-history.entity';
import { Tank } from './tank.entity';
import { Nozzle } from './nozzle.entity';

@Entity('products')
export class Product {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'enum', enum: ['Bensin', 'Solar', 'LPG'] })
  type: 'Bensin' | 'Solar' | 'LPG';

  @Column({ type: 'varchar', length: 32, default: 'Liter' })
  unit: string;

  @Column({ type: 'tinyint', default: 1 })
  active: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @OneToMany(() => PriceHistory, (ph) => ph.product)
  priceHistories: PriceHistory[];

  @OneToMany(() => Tank, (tank) => tank.product)
  tanks: Tank[];

  @OneToMany(() => Nozzle, (nozzle) => nozzle.product)
  nozzles: Nozzle[];
}
