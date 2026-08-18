import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Tank,
  Transaction,
  Card,
  CardQuota,
  Notification,
} from '../../database/entities';
import { toNum } from '../../common/utils/db.util';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Tank)
    private readonly tankRepo: Repository<Tank>,
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
    @InjectRepository(Card)
    private readonly cardRepo: Repository<Card>,
    @InjectRepository(CardQuota)
    private readonly cardQuotaRepo: Repository<CardQuota>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async getSummary() {
    const today = new Date().toISOString().slice(0, 10);
    const nowMonth = new Date().toISOString().slice(0, 7);

    const [
      stockRaw,
      todayTrxRaw,
      monthTrxRaw,
      activeCardsCount,
      quotaRaw,
      alerts,
      tanks,
      recentTrx,
    ] = await Promise.all([
      // Total stock
      this.tankRepo
        .createQueryBuilder('t')
        .select('COALESCE(SUM(t.currentL), 0)', 'total_stock')
        .getRawOne(),
      // Today's consumption
      this.txRepo
        .createQueryBuilder('t')
        .select('COALESCE(SUM(t.volumeL), 0)', 'today_l')
        .addSelect('COUNT(t.id)', 'today_trx')
        .where('DATE(t.transactionTime) = :today AND t.status = :status', {
          today,
          status: 'SUCCESS',
        })
        .getRawOne(),
      // Monthly consumption
      this.txRepo
        .createQueryBuilder('t')
        .select('COALESCE(SUM(t.volumeL), 0)', 'month_l')
        .addSelect('COUNT(t.id)', 'month_trx')
        .where(
          "DATE_FORMAT(t.transactionTime, '%Y-%m') = :nowMonth AND t.status = :status",
          {
            nowMonth,
            status: 'SUCCESS',
          },
        )
        .getRawOne(),
      // Active cards
      this.cardRepo.count({ where: { status: 'ACTIVE' } }),
      // Quota stats
      this.cardQuotaRepo
        .createQueryBuilder('cq')
        .innerJoin('cq.period', 'qp')
        .select('COALESCE(SUM(cq.allocatedL), 0)', 'total_alloc')
        .addSelect('COALESCE(SUM(cq.usedL), 0)', 'total_used')
        .addSelect('COALESCE(SUM(cq.remainingL), 0)', 'total_remaining')
        .addSelect('COALESCE(SUM(cq.expiredL), 0)', 'total_expired')
        .where("qp.status = 'ACTIVE'")
        .getRawOne(),
      // Active alerts
      this.notificationRepo.find({
        where: { read: 0 },
        order: { createdAt: 'DESC' },
        take: 10,
      }),
      // All tanks with product
      this.tankRepo
        .createQueryBuilder('t')
        .innerJoinAndSelect('t.product', 'p')
        .orderBy('p.name', 'ASC')
        .getMany(),
      // Recent 10 transactions
      this.txRepo
        .createQueryBuilder('t')
        .innerJoin('t.card', 'c')
        .innerJoin('t.product', 'p')
        .leftJoin('t.pump', 'pm')
        .leftJoin('t.nozzle', 'n')
        .select([
          't.id AS id',
          't.transactionTime AS transaction_time',
          't.volumeL AS volume_l',
          't.totalAmount AS total_amount',
          't.status AS status',
          'c.cardNumber AS card_number',
          'c.holderName AS holder_name',
          'p.name AS product_name',
          'pm.number AS pump_number',
          'n.number AS nozzle_number',
        ])
        .orderBy('t.transactionTime', 'DESC')
        .take(10)
        .getRawMany(),
    ]);

    const totalAlloc = toNum(quotaRaw?.total_alloc);
    const totalUsed = toNum(quotaRaw?.total_used);
    const utilPct =
      totalAlloc > 0
        ? Math.round((totalUsed / totalAlloc) * 10000) / 100
        : 0;

    return {
      kpi: {
        total_stock_l: toNum(stockRaw?.total_stock),
        today_consumption_l: toNum(todayTrxRaw?.today_l),
        today_transactions: toNum(todayTrxRaw?.today_trx),
        monthly_consumption_l: toNum(monthTrxRaw?.month_l),
        monthly_transactions: toNum(monthTrxRaw?.month_trx),
        active_cards: activeCardsCount,
        quota_utilization_pct: utilPct,
        quota_remaining_l: toNum(quotaRaw?.total_remaining),
        quota_expired_l: toNum(quotaRaw?.total_expired),
      },
      tanks: tanks.map((t) => ({
        id: t.id,
        product_id: t.productId,
        product_name: t.product?.name,
        code: t.product?.code,
        capacity_l: toNum(t.capacityL),
        current_l: toNum(t.currentL),
        status: t.status,
        threshold_low: toNum(t.thresholdLow),
        threshold_critical: toNum(t.thresholdCritical),
        threshold_high: toNum(t.thresholdHigh),
        last_reading_at: t.lastReadingAt,
      })),
      alerts,
      recent_transactions: recentTrx.map((r) => ({
        id: r.id,
        transaction_time: r.transaction_time,
        volume_l: toNum(r.volume_l),
        total_amount: toNum(r.total_amount),
        status: r.status,
        card_number: r.card_number,
        holder_name: r.holder_name,
        product_name: r.product_name,
        pump_number: r.pump_number,
        nozzle_number: r.nozzle_number,
      })),
      last_updated: new Date().toISOString(),
    };
  }

  async getAlerts() {
    return this.notificationRepo.find({
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async readAlert(id: string) {
    await this.notificationRepo.update(id, { read: 1 });
    return { success: true };
  }
}
