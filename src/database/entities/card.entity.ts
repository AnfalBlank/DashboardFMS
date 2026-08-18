import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Unit } from './unit.entity';
import { Vehicle } from './vehicle.entity';
import { CardQuota } from './card-quota.entity';
import { Transaction } from './transaction.entity';

@Entity('cards')
export class Card {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string;

  @Column({ name: 'card_number', type: 'varchar', length: 64, unique: true })
  cardNumber: string;

  @Column({ name: 'card_type', type: 'varchar', length: 32, default: 'REGULER' })
  cardType: 'REGULER' | 'KHUSUS';

  @Column({ type: 'varchar', length: 32, default: 'ACTIVE' })
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'EXPIRED' | 'SUSPENDED';

  @Column({ name: 'holder_name', type: 'varchar', length: 128 })
  holderName: string;

  @Column({ name: 'unit_id', type: 'varchar', length: 64, nullable: true })
  unitId?: string;

  @ManyToOne(() => Unit, (u) => u.cards, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'unit_id' })
  unit?: Unit;

  @Column({ name: 'vehicle_id', type: 'varchar', length: 64, nullable: true })
  vehicleId?: string;

  @ManyToOne(() => Vehicle, (v) => v.cards, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle?: Vehicle;

  @Column({ name: 'fuel_type', type: 'varchar', length: 64, nullable: true })
  fuelType?: string;

  @Column({ name: 'monthly_limit', type: 'decimal', precision: 12, scale: 2, default: 200 })
  monthlyLimit: number;

  @Column({ name: 'expiry_date', type: 'varchar', length: 32, nullable: true })
  expiryDate?: string;

  @Column({ name: 'activation_date', type: 'varchar', length: 32, nullable: true })
  activationDate?: string;

  @Column({ name: 'rfid_uid', type: 'varchar', length: 64, nullable: true })
  rfidUid?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @OneToMany(() => CardQuota, (cq) => cq.card)
  quotas: CardQuota[];

  @OneToMany(() => Transaction, (t) => t.card)
  transactions: Transaction[];
}
