import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Transaction,
  CardQuota,
  Reconciliation,
  Unit,
  Card,
  Totalizer,
  Tank,
} from '../../database/entities';
import { toNum } from '../../common/utils/db.util';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
    @InjectRepository(CardQuota)
    private readonly cardQuotaRepo: Repository<CardQuota>,
    @InjectRepository(Reconciliation)
    private readonly reconcileRepo: Repository<Reconciliation>,
    @InjectRepository(Unit)
    private readonly unitRepo: Repository<Unit>,
    @InjectRepository(Card)
    private readonly cardRepo: Repository<Card>,
    @InjectRepository(Totalizer)
    private readonly totalizerRepo: Repository<Totalizer>,
    @InjectRepository(Tank)
    private readonly tankRepo: Repository<Tank>,
  ) {}

  async getTransactionsReport(
    from?: string,
    to?: string,
    unitId?: string,
    productId?: string,
    limit: number = 500,
  ) {
    const qb = this.txRepo
      .createQueryBuilder('t')
      .innerJoinAndSelect('t.card', 'c')
      .innerJoinAndSelect('t.product', 'p')
      .leftJoinAndSelect('c.unit', 'u')
      .leftJoinAndSelect('c.vehicle', 'v')
      .where("t.status = 'SUCCESS'");

    if (from) {
      qb.andWhere('DATE(t.transactionTime) >= :from', { from });
    }
    if (to) {
      qb.andWhere('DATE(t.transactionTime) <= :to', { to });
    }
    if (unitId) {
      qb.andWhere('c.unitId = :unitId', { unitId });
    }
    if (productId) {
      qb.andWhere('t.productId = :productId', { productId });
    }

    qb.orderBy('t.transactionTime', 'DESC').take(Number(limit));

    const list = await qb.getMany();

    const rows = list.map((t) => ({
      id: t.id,
      card_id: t.cardId,
      card_number: t.card?.cardNumber,
      holder_name: t.card?.holderName,
      unit_name: t.card?.unit?.name,
      product_name: t.product?.name,
      police_number: t.card?.vehicle?.policeNumber,
      volume_l: toNum(t.volumeL),
      price_per_unit: toNum(t.pricePerUnit),
      total_amount: toNum(t.totalAmount),
      status: t.status,
      shift: t.shift,
      transaction_time: t.transactionTime,
    }));

    const total_volume = rows.reduce((s, r) => s + r.volume_l, 0);
    const total_amount = rows.reduce((s, r) => s + r.total_amount, 0);

    return {
      data: rows,
      summary: {
        total_transactions: rows.length,
        total_volume_l: Math.round(total_volume * 100) / 100,
        total_amount_idr: Math.round(total_amount),
        avg_volume_l:
          rows.length > 0
            ? Math.round((total_volume / rows.length) * 100) / 100
            : 0,
      },
    };
  }

  async getQuotaReport(periodId?: string) {
    const qb = this.cardQuotaRepo
      .createQueryBuilder('cq')
      .innerJoinAndSelect('cq.card', 'c')
      .innerJoinAndSelect('cq.product', 'p')
      .innerJoinAndSelect('cq.period', 'qp')
      .leftJoinAndSelect('c.unit', 'u');

    if (periodId) {
      qb.where('cq.periodId = :periodId', { periodId });
    } else {
      qb.where("qp.status = 'ACTIVE'");
    }

    qb.orderBy('c.cardNumber', 'ASC');

    const list = await qb.getMany();

    const rows = list.map((cq) => ({
      id: cq.id,
      card_number: cq.card?.cardNumber,
      holder_name: cq.card?.holderName,
      unit_name: cq.card?.unit?.name,
      product_name: cq.product?.name,
      period: cq.period?.period,
      allocated_l: toNum(cq.allocatedL),
      used_l: toNum(cq.usedL),
      remaining_l: toNum(cq.remainingL),
      topup_l: toNum(cq.topupL),
      expired_l: toNum(cq.expiredL),
    }));

    return {
      data: rows,
      summary: {
        total_allocated: rows.reduce((s, r) => s + r.allocated_l, 0),
        total_used: rows.reduce((s, r) => s + r.used_l, 0),
        total_remaining: rows.reduce((s, r) => s + r.remaining_l, 0),
        total_topup: rows.reduce((s, r) => s + r.topup_l, 0),
        total_expired: rows.reduce((s, r) => s + r.expired_l, 0),
      },
    };
  }

  async getStockReport() {
    const list = await this.reconcileRepo
      .createQueryBuilder('r')
      .innerJoinAndSelect('r.product', 'p')
      .orderBy('r.date', 'DESC')
      .addOrderBy('p.name', 'ASC')
      .getMany();

    return list.map((r) => ({
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
    }));
  }

  async getUsageReport(from?: string, to?: string) {
    const unitQb = this.unitRepo
      .createQueryBuilder('u')
      .leftJoin('u.cards', 'c')
      .leftJoin(
        'c.transactions',
        't',
        "t.status = 'SUCCESS'" +
          (from && to ? ' AND DATE(t.transactionTime) BETWEEN :from AND :to' : ''),
        { from, to },
      )
      .select([
        'u.id AS id',
        'u.name AS name',
        'COUNT(t.id) AS trx_count',
        'COALESCE(SUM(t.volumeL), 0) AS total_l',
        'COALESCE(SUM(t.totalAmount), 0) AS total_amount',
      ])
      .groupBy('u.id, u.name')
      .orderBy('total_l', 'DESC');

    const cardQb = this.cardRepo
      .createQueryBuilder('c')
      .leftJoin('c.unit', 'u')
      .leftJoin(
        'c.transactions',
        't',
        "t.status = 'SUCCESS'" +
          (from && to ? ' AND DATE(t.transactionTime) BETWEEN :from AND :to' : ''),
        { from, to },
      )
      .select([
        'c.cardNumber AS card_number',
        'c.holderName AS holder_name',
        'u.name AS unit_name',
        'COUNT(t.id) AS trx_count',
        'COALESCE(SUM(t.volumeL), 0) AS total_l',
        'COALESCE(SUM(t.totalAmount), 0) AS total_amount',
      ])
      .groupBy('c.id, u.name')
      .orderBy('total_l', 'DESC')
      .take(50);

    const [byUnit, byCard] = await Promise.all([
      unitQb.getRawMany(),
      cardQb.getRawMany(),
    ]);

    return {
      by_unit: byUnit.map((r) => ({
        id: r.id,
        name: r.name,
        trx_count: toNum(r.trx_count),
        total_l: toNum(r.total_l),
        total_amount: toNum(r.total_amount),
      })),
      by_card: byCard.map((r) => ({
        card_number: r.card_number,
        holder_name: r.holder_name,
        unit_name: r.unit_name,
        trx_count: toNum(r.trx_count),
        total_l: toNum(r.total_l),
        total_amount: toNum(r.total_amount),
      })),
    };
  }

  async getTotalizerReport() {
    const list = await this.totalizerRepo
      .createQueryBuilder('t')
      .innerJoinAndSelect('t.nozzle', 'n')
      .innerJoinAndSelect('n.pump', 'pm')
      .innerJoinAndSelect('n.product', 'pr')
      .orderBy('t.shiftDate', 'DESC')
      .addOrderBy('pm.number', 'ASC')
      .addOrderBy('n.number', 'ASC')
      .getMany();

    return list.map((t) => {
      const openVal = toNum(t.openingValue);
      const currVal = toNum(t.currentValue);
      return {
        id: t.id,
        nozzle_id: t.nozzleId,
        nozzle_number: t.nozzle?.number,
        pump_number: t.nozzle?.pump?.number,
        product_name: t.nozzle?.product?.name,
        opening_value: openVal,
        current_value: currVal,
        shift_date: t.shiftDate,
        shift: t.shift,
        usage_l: currVal - openVal,
      };
    });
  }

  async getExecutiveReport(month?: string, year?: string) {
    const y = year ?? new Date().getFullYear().toString();
    const m = month ?? String(new Date().getMonth() + 1).padStart(2, '0');
    const prefix = `${y}-${m.padStart(2, '0')}`;

    const [trxRaw, tanks, quotaRaw, reconcileRaw, topCards] =
      await Promise.all([
        this.txRepo
          .createQueryBuilder('t')
          .select([
            'COUNT(*) AS total_trx',
            'COALESCE(SUM(t.volumeL), 0) AS total_volume',
            'COALESCE(SUM(t.totalAmount), 0) AS total_amount',
          ])
          .where("DATE_FORMAT(t.transactionTime, '%Y-%m') = :prefix AND t.status = 'SUCCESS'", { prefix })
          .getRawOne(),
        this.tankRepo
          .createQueryBuilder('t')
          .innerJoinAndSelect('t.product', 'p')
          .getMany(),
        this.cardQuotaRepo
          .createQueryBuilder('cq')
          .innerJoin('cq.period', 'qp')
          .select([
            'COALESCE(SUM(cq.allocatedL), 0) AS total_alloc',
            'COALESCE(SUM(cq.usedL), 0) AS total_used',
            'COALESCE(SUM(cq.remainingL), 0) AS total_remaining',
            'COALESCE(SUM(cq.expiredL), 0) AS total_expired',
          ])
          .where('qp.year = :year AND qp.month = :month', {
            year: Number(y),
            month: Number(m),
          })
          .getRawOne(),
        this.reconcileRepo
          .createQueryBuilder('r')
          .select('COALESCE(AVG(r.variancePct), 0)', 'avg_variance')
          .where("DATE_FORMAT(r.date, '%Y-%m') = :prefix", { prefix })
          .getRawOne(),
        this.cardRepo
          .createQueryBuilder('c')
          .leftJoin('c.unit', 'u')
          .leftJoin(
            'c.transactions',
            't',
            "DATE_FORMAT(t.transactionTime, '%Y-%m') = :prefix AND t.status = 'SUCCESS'",
            { prefix },
          )
          .select([
            'c.cardNumber AS card_number',
            'c.holderName AS holder_name',
            'u.name AS unit_name',
            'COALESCE(SUM(t.volumeL), 0) AS total_l',
          ])
          .groupBy('c.id, u.name')
          .orderBy('total_l', 'DESC')
          .take(10)
          .getRawMany(),
      ]);

    return {
      transactions: {
        total_trx: toNum(trxRaw?.total_trx),
        total_volume: toNum(trxRaw?.total_volume),
        total_amount: toNum(trxRaw?.total_amount),
      },
      stock: tanks.map((t) => ({
        name: t.product?.name,
        current_l: toNum(t.currentL),
        capacity_l: toNum(t.capacityL),
        status: t.status,
      })),
      quota: {
        total_alloc: toNum(quotaRaw?.total_alloc),
        total_used: toNum(quotaRaw?.total_used),
        total_remaining: toNum(quotaRaw?.total_remaining),
        total_expired: toNum(quotaRaw?.total_expired),
      },
      avg_variance: toNum(reconcileRaw?.avg_variance),
      top_cards: topCards.map((c) => ({
        card_number: c.card_number,
        holder_name: c.holder_name,
        unit_name: c.unit_name,
        total_l: toNum(c.total_l),
      })),
      period: prefix,
    };
  }
}
