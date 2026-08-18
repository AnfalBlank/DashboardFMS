import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  CardQuota,
  QuotaPeriod,
  QuotaLedger,
  Card,
} from '../../database/entities';
import { AuditService } from '../audit/audit.service';
import { toNum } from '../../common/utils/db.util';
import { v4 as uuid } from 'uuid';
import { GenerateQuotaDto } from './dto/generate-quota.dto';
import { TopupQuotaDto } from './dto/topup-quota.dto';

@Injectable()
export class QuotaService {
  constructor(
    @InjectRepository(CardQuota)
    private readonly cardQuotaRepo: Repository<CardQuota>,
    @InjectRepository(QuotaPeriod)
    private readonly quotaPeriodRepo: Repository<QuotaPeriod>,
    @InjectRepository(QuotaLedger)
    private readonly quotaLedgerRepo: Repository<QuotaLedger>,
    @InjectRepository(Card)
    private readonly cardRepo: Repository<Card>,
    private readonly dataSource: DataSource,
    private readonly audit: AuditService,
  ) {}

  async findAll(period_id?: string, card_id?: string, unit_id?: string) {
    const qb = this.cardQuotaRepo
      .createQueryBuilder('cq')
      .innerJoinAndSelect('cq.card', 'c')
      .innerJoinAndSelect('cq.period', 'qp')
      .innerJoinAndSelect('cq.product', 'p')
      .leftJoinAndSelect('c.unit', 'u');

    if (period_id) {
      qb.andWhere('cq.periodId = :period_id', { period_id });
    } else {
      qb.andWhere("qp.status = 'ACTIVE'");
    }
    if (card_id) {
      qb.andWhere('cq.cardId = :card_id', { card_id });
    }
    if (unit_id) {
      qb.andWhere('c.unitId = :unit_id', { unit_id });
    }

    qb.orderBy('c.cardNumber', 'ASC');

    const rows = await qb.getMany();

    return rows.map((cq) => ({
      id: cq.id,
      card_id: cq.cardId,
      card_number: cq.card?.cardNumber,
      holder_name: cq.card?.holderName,
      unit_id: cq.card?.unitId,
      fuel_type: cq.card?.fuelType,
      unit_name: cq.card?.unit?.name,
      product_id: cq.productId,
      product_name: cq.product?.name,
      period_id: cq.periodId,
      period: cq.period?.period,
      year: cq.period?.year,
      month: cq.period?.month,
      allocated_l: toNum(cq.allocatedL),
      used_l: toNum(cq.usedL),
      remaining_l: toNum(cq.remainingL),
      topup_l: toNum(cq.topupL),
      expired_l: toNum(cq.expiredL),
      status: cq.status,
      created_at: cq.createdAt,
      updated_at: cq.updatedAt,
    }));
  }

  async findPeriods() {
    const rows = await this.quotaPeriodRepo.find({
      order: { year: 'DESC', month: 'DESC' },
    });
    return rows.map((qp) => ({
      id: qp.id,
      period: qp.period,
      year: qp.year,
      month: qp.month,
      status: qp.status,
      closed_at: qp.closedAt,
      closed_by: qp.closedBy,
      created_at: qp.createdAt,
    }));
  }

  async findLedger(cardId: string) {
    const list = await this.quotaLedgerRepo
      .createQueryBuilder('ql')
      .innerJoinAndSelect('ql.quota', 'cq')
      .innerJoinAndSelect('cq.period', 'qp')
      .where('ql.cardId = :cardId', { cardId })
      .orderBy('ql.createdAt', 'DESC')
      .take(50)
      .getMany();

    return list.map((ql) => ({
      id: ql.id,
      quota_id: ql.quotaId,
      card_id: ql.cardId,
      type: ql.type,
      amount_l: toNum(ql.amountL),
      balance_l: toNum(ql.balanceL),
      ref_id: ql.refId,
      description: ql.description,
      period: ql.quota?.period?.period,
      created_by: ql.createdBy,
      created_at: ql.createdAt,
    }));
  }

  async generate(dto: GenerateQuotaDto, userId: string, ip?: string) {
    let periodId: string;
    const existPeriod = await this.quotaPeriodRepo.findOneBy({
      year: dto.year,
      month: dto.month,
    });

    if (existPeriod) {
      periodId = existPeriod.id;
    } else {
      periodId = uuid();
      const newPeriod = this.quotaPeriodRepo.create({
        id: periodId,
        period: dto.period,
        year: dto.year,
        month: dto.month,
        status: 'ACTIVE',
      });
      await this.quotaPeriodRepo.save(newPeriod);
    }

    const cardQb = this.cardRepo
      .createQueryBuilder('c')
      .where("c.status = 'ACTIVE'");

    if (dto.scope === 'unit' && dto.unit_id) {
      cardQb.andWhere('c.unitId = :unitId', { unitId: dto.unit_id });
    }
    if (dto.scope === 'custom' && dto.card_ids?.length) {
      cardQb.andWhere('c.id IN (:...cardIds)', { cardIds: dto.card_ids });
    }

    const cards = await cardQb.getMany();
    let created = 0;

    await this.dataSource.transaction(async (em) => {
      for (const card of cards) {
        const existingQuota = await em.findOne(CardQuota, {
          where: {
            cardId: card.id,
            periodId,
            productId: dto.product_id,
          },
        });

        if (!existingQuota) {
          const qId = uuid();
          const newQuota = em.create(CardQuota, {
            id: qId,
            cardId: card.id,
            periodId,
            productId: dto.product_id,
            allocatedL: dto.default_l,
            usedL: 0,
            remainingL: dto.default_l,
            status: 'ACTIVE',
          });
          await em.save(CardQuota, newQuota);

          const ledger = em.create(QuotaLedger, {
            id: uuid(),
            quotaId: qId,
            cardId: card.id,
            type: 'ALLOCATION',
            amountL: dto.default_l,
            balanceL: dto.default_l,
            description: `Monthly Allocation ${dto.period}`,
            createdBy: userId,
          });
          await em.save(QuotaLedger, ledger);
          created++;
        }
      }
    });

    await this.audit.logAudit(
      userId,
      'GENERATE_QUOTA',
      'Quota',
      periodId,
      null,
      { period: dto.period, cards: created, default_l: dto.default_l },
      null,
      ip,
    );

    return {
      period_id: periodId,
      cards_processed: cards.length,
      quotas_created: created,
      total_l: created * dto.default_l,
    };
  }

  async topup(dto: TopupQuotaDto, userId: string, ip?: string) {
    const quota = await this.cardQuotaRepo
      .createQueryBuilder('cq')
      .innerJoin('cq.period', 'qp')
      .where('cq.cardId = :cardId AND cq.productId = :productId AND qp.status = :status', {
        cardId: dto.card_id,
        productId: dto.product_id,
        status: 'ACTIVE',
      })
      .getOne();

    if (!quota) {
      throw new NotFoundException({
        success: false,
        message: 'Kuota tidak ditemukan untuk periode aktif',
      });
    }

    const currentRemaining = toNum(quota.remainingL);
    const newRemaining = currentRemaining + dto.amount_l;

    await this.dataSource.transaction(async (em) => {
      await em
        .createQueryBuilder()
        .update(CardQuota)
        .set({
          remainingL: () => `remaining_l + ${dto.amount_l}`,
          topupL: () => `topup_l + ${dto.amount_l}`,
          allocatedL: () => `allocated_l + ${dto.amount_l}`,
        })
        .where('id = :id', { id: quota.id })
        .execute();

      const ledger = em.create(QuotaLedger, {
        id: uuid(),
        quotaId: quota.id,
        cardId: dto.card_id,
        type: 'TOPUP',
        amountL: dto.amount_l,
        balanceL: newRemaining,
        description: `Top Up: ${dto.reason}`,
        createdBy: userId,
      });
      await em.save(QuotaLedger, ledger);
    });

    await this.audit.logAudit(
      userId,
      'TOPUP_QUOTA',
      'Quota',
      quota.id,
      { remaining_l: quota.remainingL },
      { remaining_l: newRemaining, topup: dto.amount_l },
      dto.reason,
      ip,
    );

    return {
      quota_id: quota.id,
      new_remaining_l: newRemaining,
    };
  }
}
