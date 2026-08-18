import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  Transaction,
  Card,
  CardQuota,
  QuotaLedger,
  PriceHistory,
  Tank,
  SystemSetting,
} from '../../database/entities';
import { AuditService } from '../audit/audit.service';
import { toNum } from '../../common/utils/db.util';
import { v4 as uuid } from 'uuid';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
    @InjectRepository(Card)
    private readonly cardRepo: Repository<Card>,
    @InjectRepository(CardQuota)
    private readonly cardQuotaRepo: Repository<CardQuota>,
    @InjectRepository(PriceHistory)
    private readonly priceHistoryRepo: Repository<PriceHistory>,
    @InjectRepository(SystemSetting)
    private readonly settingRepo: Repository<SystemSetting>,
    private readonly dataSource: DataSource,
    private readonly audit: AuditService,
  ) {}

  async getActivePrice(productId: string): Promise<number> {
    const ph = await this.priceHistoryRepo
      .createQueryBuilder('ph')
      .where('ph.productId = :productId', { productId })
      .orderBy('ph.effectiveDate', 'DESC')
      .getOne();
    return toNum(ph?.pricePerUnit, 0);
  }

  async findAll(
    card?: string,
    unit?: string,
    product?: string,
    status?: string,
    from?: string,
    to?: string,
    limit: number = 50,
    offset: number = 0,
  ) {
    const qb = this.txRepo
      .createQueryBuilder('t')
      .innerJoinAndSelect('t.card', 'c')
      .innerJoinAndSelect('t.product', 'p')
      .leftJoinAndSelect('t.nozzle', 'n')
      .leftJoinAndSelect('t.pump', 'pm')
      .leftJoinAndSelect('c.unit', 'u');

    if (card) {
      qb.andWhere(
        '(c.cardNumber LIKE :card OR c.holderName LIKE :card)',
        { card: `%${card}%` },
      );
    }
    if (unit) {
      qb.andWhere('c.unitId = :unit', { unit });
    }
    if (product) {
      qb.andWhere('t.productId = :product', { product });
    }
    if (status) {
      qb.andWhere('t.status = :status', { status });
    }
    if (from) {
      qb.andWhere('DATE(t.transactionTime) >= :from', { from });
    }
    if (to) {
      qb.andWhere('DATE(t.transactionTime) <= :to', { to });
    }

    qb.orderBy('t.transactionTime', 'DESC')
      .take(Number(limit))
      .skip(Number(offset));

    const [rows, total] = await qb.getManyAndCount();

    const data = rows.map((t) => ({
      id: t.id,
      card_id: t.cardId,
      card_number: t.card?.cardNumber,
      holder_name: t.card?.holderName,
      unit_id: t.card?.unitId,
      unit_name: t.card?.unit?.name,
      product_id: t.productId,
      product_name: t.product?.name,
      nozzle_id: t.nozzleId,
      nozzle_number: t.nozzle?.number,
      pump_id: t.pumpId,
      pump_number: t.pump?.number,
      operator_id: t.operatorId,
      shift: t.shift,
      volume_l: toNum(t.volumeL),
      price_per_unit: toNum(t.pricePerUnit),
      total_amount: toNum(t.totalAmount),
      totalizer_before: toNum(t.totalizerBefore),
      totalizer_after: toNum(t.totalizerAfter),
      quota_before: toNum(t.quotaBefore),
      quota_deducted: toNum(t.quotaDeducted),
      quota_after: toNum(t.quotaAfter),
      status: t.status,
      source: t.source,
      void_reason: t.voidReason,
      voided_by: t.voidedBy,
      voided_at: t.voidedAt,
      transaction_time: t.transactionTime,
      synced: t.synced,
      created_at: t.createdAt,
    }));

    return {
      data,
      meta: { total, limit: Number(limit), offset: Number(offset) },
    };
  }

  async findOne(id: string) {
    const t = await this.txRepo
      .createQueryBuilder('t')
      .innerJoinAndSelect('t.card', 'c')
      .innerJoinAndSelect('t.product', 'p')
      .leftJoinAndSelect('t.nozzle', 'n')
      .leftJoinAndSelect('t.pump', 'pm')
      .leftJoinAndSelect('c.unit', 'u')
      .leftJoinAndSelect('c.vehicle', 'v')
      .where('t.id = :id', { id })
      .getOne();

    if (!t) {
      throw new NotFoundException({
        success: false,
        message: 'Transaksi tidak ditemukan',
      });
    }

    return {
      id: t.id,
      card_id: t.cardId,
      card_number: t.card?.cardNumber,
      holder_name: t.card?.holderName,
      unit_id: t.card?.unitId,
      unit_name: t.card?.unit?.name,
      police_number: t.card?.vehicle?.policeNumber,
      product_id: t.productId,
      product_name: t.product?.name,
      nozzle_id: t.nozzleId,
      nozzle_number: t.nozzle?.number,
      pump_id: t.pumpId,
      pump_number: t.pump?.number,
      operator_id: t.operatorId,
      shift: t.shift,
      volume_l: toNum(t.volumeL),
      price_per_unit: toNum(t.pricePerUnit),
      total_amount: toNum(t.totalAmount),
      totalizer_before: toNum(t.totalizerBefore),
      totalizer_after: toNum(t.totalizerAfter),
      quota_before: toNum(t.quotaBefore),
      quota_deducted: toNum(t.quotaDeducted),
      quota_after: toNum(t.quotaAfter),
      status: t.status,
      source: t.source,
      void_reason: t.voidReason,
      voided_by: t.voidedBy,
      voided_at: t.voidedAt,
      transaction_time: t.transactionTime,
      synced: t.synced,
      created_at: t.createdAt,
    };
  }

  async create(dto: CreateTransactionDto, userId: string, ip?: string) {
    const card = await this.cardRepo.findOneBy({ cardNumber: dto.card_number });
    if (!card) {
      throw new NotFoundException({
        success: false,
        message: 'Kartu tidak ditemukan',
      });
    }
    if (card.status !== 'ACTIVE') {
      throw new BadRequestException({
        success: false,
        message: `Kartu berstatus ${card.status}`,
      });
    }

    const quota = await this.cardQuotaRepo
      .createQueryBuilder('cq')
      .innerJoin('cq.period', 'qp')
      .where('cq.cardId = :cardId AND cq.productId = :productId AND qp.status = :status', {
        cardId: card.id,
        productId: dto.product_id,
        status: 'ACTIVE',
      })
      .getOne();

    let quotaBefore = 0;
    let quotaDeducted = 0;
    let quotaAfter = 0;
    let txStatus: 'SUCCESS' | 'FAILED' = 'SUCCESS';

    if (quota) {
      quotaBefore = toNum(quota.remainingL);
      const overflowSetting = await this.settingRepo.findOneBy({ key: 'quota_overflow' });
      const policy = overflowSetting?.value ?? 'reject';

      if (dto.volume_l > quotaBefore) {
        if (policy === 'reject') {
          throw new BadRequestException({
            success: false,
            message: `Kuota tidak cukup. Sisa: ${quotaBefore} L, Diminta: ${dto.volume_l} L`,
          });
        }
      }
      quotaDeducted = Math.min(dto.volume_l, quotaBefore);
      quotaAfter = Math.max(0, quotaBefore - dto.volume_l);
      txStatus = 'SUCCESS';
    }

    const price = await this.getActivePrice(dto.product_id);
    const total = price * dto.volume_l;
    const txId = uuid();

    await this.dataSource.transaction(async (em) => {
      const tx = em.create(Transaction, {
        id: txId,
        cardId: card.id,
        productId: dto.product_id,
        nozzleId: dto.nozzle_id ?? undefined,
        pumpId: dto.pump_id ?? undefined,
        operatorId: userId,
        shift: dto.shift ?? 'PAGI',
        volumeL: dto.volume_l,
        pricePerUnit: price,
        totalAmount: total,
        totalizerBefore: dto.totalizer_before ?? undefined,
        totalizerAfter: dto.totalizer_after ?? undefined,
        quotaBefore,
        quotaDeducted,
        quotaAfter,
        status: txStatus,
        source: dto.source ?? 'MANUAL',
        transactionTime: dto.transaction_time ? new Date(dto.transaction_time) : new Date(),
      });
      await em.save(Transaction, tx);

      if (txStatus === 'SUCCESS' && quota) {
        await em
          .createQueryBuilder()
          .update(CardQuota)
          .set({
            usedL: () => `used_l + ${quotaDeducted}`,
            remainingL: () => `remaining_l - ${quotaDeducted}`,
          })
          .where('id = :id', { id: quota.id })
          .execute();

        const ledger = em.create(QuotaLedger, {
          id: uuid(),
          quotaId: quota.id,
          cardId: card.id,
          type: 'DEDUCTION',
          amountL: -quotaDeducted,
          balanceL: quotaAfter,
          refId: txId,
          description: 'Fuel Transaction',
          createdBy: userId,
        });
        await em.save(QuotaLedger, ledger);

        await em
          .createQueryBuilder()
          .update(Tank)
          .set({
            currentL: () => `GREATEST(0, current_l - ${dto.volume_l})`,
          })
          .where('productId = :productId', { productId: dto.product_id })
          .execute();
      }
    });

    await this.audit.logAudit(
      userId,
      'CREATE_TRANSACTION',
      'Transaction',
      txId,
      null,
      { volume: dto.volume_l },
      null,
      ip,
    );

    return {
      id: txId,
      status: txStatus,
      quota_after: quotaAfter,
    };
  }

  async void(id: string, reason: string, userId: string, ip?: string) {
    if (!reason) {
      throw new BadRequestException({
        success: false,
        message: 'Alasan void wajib diisi',
      });
    }

    const tx = await this.txRepo.findOneBy({ id });
    if (!tx) {
      throw new NotFoundException({
        success: false,
        message: 'Transaksi tidak ditemukan',
      });
    }
    if (tx.status !== 'SUCCESS') {
      throw new BadRequestException({
        success: false,
        message: 'Hanya transaksi SUCCESS yang bisa di-VOID',
      });
    }

    await this.dataSource.transaction(async (em) => {
      await em.update(
        Transaction,
        { id },
        {
          status: 'VOID',
          voidReason: reason,
          voidedBy: userId,
          voidedAt: new Date(),
        },
      );

      const deducted = toNum(tx.quotaDeducted);
      if (deducted > 0) {
        const quota = await em
          .createQueryBuilder(CardQuota, 'cq')
          .innerJoin('cq.period', 'qp')
          .where('cq.cardId = :cardId AND cq.productId = :productId AND qp.status = :status', {
            cardId: tx.cardId,
            productId: tx.productId,
            status: 'ACTIVE',
          })
          .getOne();

        if (quota) {
          const newRemaining = toNum(quota.remainingL) + deducted;
          await em
            .createQueryBuilder()
            .update(CardQuota)
            .set({
              usedL: () => `used_l - ${deducted}`,
              remainingL: () => `remaining_l + ${deducted}`,
            })
            .where('id = :id', { id: quota.id })
            .execute();

          const ledger = em.create(QuotaLedger, {
            id: uuid(),
            quotaId: quota.id,
            cardId: tx.cardId,
            type: 'REVERSAL',
            amountL: deducted,
            balanceL: newRemaining,
            refId: id,
            description: `VOID: ${reason}`,
            createdBy: userId,
          });
          await em.save(QuotaLedger, ledger);
        }
      }
    });

    await this.audit.logAudit(
      userId,
      'VOID_TRANSACTION',
      'Transaction',
      id,
      { status: 'SUCCESS' },
      { status: 'VOID', reason },
      reason,
      ip,
    );

    return { message: 'Transaksi berhasil di-void' };
  }
}
