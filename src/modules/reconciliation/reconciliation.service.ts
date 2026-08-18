import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Reconciliation,
  Product,
  StockMovement,
  Delivery,
  Transaction,
  Tank,
  SystemSetting,
} from '../../database/entities';
import { AuditService } from '../audit/audit.service';
import { toNum } from '../../common/utils/db.util';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ReconciliationService {
  constructor(
    @InjectRepository(Reconciliation)
    private readonly reconcileRepo: Repository<Reconciliation>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(StockMovement)
    private readonly stockMovementRepo: Repository<StockMovement>,
    @InjectRepository(Delivery)
    private readonly deliveryRepo: Repository<Delivery>,
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
    @InjectRepository(Tank)
    private readonly tankRepo: Repository<Tank>,
    @InjectRepository(SystemSetting)
    private readonly settingRepo: Repository<SystemSetting>,
    private readonly audit: AuditService,
  ) {}

  async getReconciliations(date?: string) {
    const qb = this.reconcileRepo
      .createQueryBuilder('r')
      .innerJoinAndSelect('r.product', 'p');

    if (date) {
      qb.where('r.date = :date', { date });
    } else {
      qb.where('r.date = CURDATE()');
    }

    qb.orderBy('p.name', 'ASC');

    const rows = await qb.getMany();

    return rows.map((r) => ({
      id: r.id,
      product_id: r.productId,
      product_name: r.product?.name,
      date: r.date,
      opening_l: toNum(r.openingL),
      delivery_l: toNum(r.deliveryL),
      sales_l: toNum(r.salesL),
      adjustment_l: toNum(r.adjustmentL),
      theoretical_closing: toNum(r.theoreticalClosing),
      actual_closing: toNum(r.actualClosing),
      variance_l: toNum(r.varianceL),
      variance_pct: toNum(r.variancePct),
      status: r.status,
      notes: r.notes,
      created_by: r.createdBy,
      created_at: r.createdAt,
    }));
  }

  async runReconciliation(date?: string, userId?: string, ip?: string) {
    const targetDate: string = date ?? new Date().toISOString().slice(0, 10);

    const thresholdSettings = await this.settingRepo
      .createQueryBuilder('s')
      .where('s.key IN (:...keys)', {
        keys: ['variance_normal', 'variance_warning', 'variance_critical'],
      })
      .getMany();

    const thresholds: Record<string, number> = {};
    for (const s of thresholdSettings) {
      thresholds[s.key] = Number(s.value);
    }

    const products = await this.productRepo.find({ where: { active: 1 } });
    const results: Record<string, unknown>[] = [];

    for (const prod of products) {
      const openingSm = await this.stockMovementRepo
        .createQueryBuilder('sm')
        .where('sm.productId = :prodId AND DATE(sm.createdAt) < :targetDate AND sm.type IN (:...types)', {
          prodId: prod.id,
          targetDate,
          types: ['CLOSING', 'OPENING'],
        })
        .orderBy('sm.createdAt', 'DESC')
        .getOne();
      const opening = toNum(openingSm?.balanceL);

      const deliveryRaw = await this.deliveryRepo
        .createQueryBuilder('d')
        .select('COALESCE(SUM(d.quantity_l), 0)', 'total')
        .where('d.productId = :prodId AND d.date = :targetDate AND d.status = :status', {
          prodId: prod.id,
          targetDate,
          status: 'CONFIRMED',
        })
        .getRawOne();
      const delivery = toNum(deliveryRaw?.total);

      const salesRaw = await this.txRepo
        .createQueryBuilder('t')
        .select('COALESCE(SUM(t.volume_l), 0)', 'total')
        .where('t.productId = :prodId AND DATE(t.transactionTime) = :targetDate AND t.status = :status', {
          prodId: prod.id,
          targetDate,
          status: 'SUCCESS',
        })
        .getRawOne();
      const sales = toNum(salesRaw?.total);

      const adjRaw = await this.stockMovementRepo
        .createQueryBuilder('sm')
        .select('COALESCE(SUM(sm.quantity_l), 0)', 'total')
        .where('sm.productId = :prodId AND DATE(sm.createdAt) = :targetDate AND sm.type = :type', {
          prodId: prod.id,
          targetDate,
          type: 'ADJUSTMENT',
        })
        .getRawOne();
      const adjustment = toNum(adjRaw?.total);

      const theoreticalClosing = opening + delivery - sales + adjustment;

      const tankRaw = await this.tankRepo
        .createQueryBuilder('t')
        .select('COALESCE(SUM(t.current_l), 0)', 'total')
        .where('t.productId = :prodId', { prodId: prod.id })
        .getRawOne();
      const actualClosing = toNum(tankRaw?.total);

      const varianceL = actualClosing - theoreticalClosing;
      const variancePct =
        theoreticalClosing > 0 ? (varianceL / theoreticalClosing) * 100 : 0;
      const absVarPct = Math.abs(variancePct);
      const status: 'PERFECT' | 'NORMAL' | 'WARNING' | 'CRITICAL' =
        varianceL === 0
          ? 'PERFECT'
          : absVarPct <= (thresholds.variance_normal ?? 0.5)
            ? 'NORMAL'
            : absVarPct <= (thresholds.variance_warning ?? 1.0)
              ? 'WARNING'
              : 'CRITICAL';

      const existing = await this.reconcileRepo.findOne({
        where: { productId: prod.id, date: targetDate },
      });

      if (existing) {
        await this.reconcileRepo.update(existing.id, {
          openingL: opening,
          deliveryL: delivery,
          salesL: sales,
          adjustmentL: adjustment,
          theoreticalClosing,
          actualClosing,
          varianceL,
          variancePct: Math.round(variancePct * 100) / 100,
          status,
          createdBy: userId ?? undefined,
        });
      } else {
        const newRecon = this.reconcileRepo.create({
          id: uuid(),
          productId: prod.id,
          date: targetDate,
          openingL: opening,
          deliveryL: delivery,
          salesL: sales,
          adjustmentL: adjustment,
          theoreticalClosing,
          actualClosing,
          varianceL,
          variancePct: Math.round(variancePct * 100) / 100,
          status,
          createdBy: userId ?? undefined,
        });
        await this.reconcileRepo.save(newRecon);
      }

      results.push({
        product: prod.name,
        opening,
        delivery,
        sales,
        adjustment,
        theoreticalClosing,
        actualClosing,
        varianceL,
        variancePct: Math.round(variancePct * 100) / 100,
        status,
      });
    }

    await this.audit.logAudit(
      userId,
      'RUN_RECONCILIATION',
      'Reconciliation',
      targetDate,
      null,
      { date: targetDate, products: results.length },
      null,
      ip,
    );

    return results;
  }
}
