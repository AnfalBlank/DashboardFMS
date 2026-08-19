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
  Product,
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
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly dataSource: DataSource,
    private readonly audit: AuditService,
  ) {}

  async findAll(period_id?: string, card_id?: string, unit_id?: string) {
    const qb = this.cardQuotaRepo
      .createQueryBuilder('cq')
      .innerJoinAndSelect('cq.card', 'c')
      .innerJoinAndSelect('cq.period', 'qp')
      .innerJoinAndSelect('cq.product', 'p')
      .leftJoinAndSelect('c.unit', 'u')
      .leftJoinAndSelect('c.vehicle', 'v')
      .leftJoinAndSelect('v.product', 'vp');

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
      fuel_type: cq.card?.vehicle?.product?.name ?? cq.card?.vehicle?.fuelType ?? cq.card?.fuelType,
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
      .leftJoinAndSelect('c.vehicle', 'v')
      .leftJoinAndSelect('v.product', 'vp')
      .where("c.status = 'ACTIVE'");

    if (dto.scope === 'unit' && dto.unit_id) {
      cardQb.andWhere('c.unitId = :unitId', { unitId: dto.unit_id });
    }
    if (dto.scope === 'custom' && dto.card_ids?.length) {
      cardQb.andWhere('c.id IN (:...cardIds)', { cardIds: dto.card_ids });
    }

    const cards = await cardQb.getMany();
    const allProducts = await this.productRepo.find();

    const productMapById = new Map<string, Product>();
    const productMapByCode = new Map<string, Product>();
    const productMapByName = new Map<string, Product>();

    for (const p of allProducts) {
      productMapById.set(p.id, p);
      if (p.code) productMapByCode.set(p.code.toLowerCase(), p);
      if (p.name) productMapByName.set(p.name.toLowerCase(), p);
    }

    const resolveCardProductId = (card: Card): string | null => {
      // 1. Check vehicle.productId
      if (card.vehicle?.productId && productMapById.has(card.vehicle.productId)) {
        return card.vehicle.productId;
      }
      // 2. Check card.fuelType
      if (card.fuelType) {
        const ft = card.fuelType.trim();
        if (productMapById.has(ft)) return ft;
        const ftLower = ft.toLowerCase();
        if (productMapByCode.has(ftLower)) return productMapByCode.get(ftLower)!.id;
        if (productMapByName.has(ftLower)) return productMapByName.get(ftLower)!.id;
      }
      // 3. Check vehicle.fuelType
      if (card.vehicle?.fuelType) {
        const vft = card.vehicle.fuelType.trim();
        if (productMapById.has(vft)) return vft;
        const vftLower = vft.toLowerCase();
        if (productMapByCode.has(vftLower)) return productMapByCode.get(vftLower)!.id;
        if (productMapByName.has(vftLower)) return productMapByName.get(vftLower)!.id;
      }
      // 4. Fallback to dto.product_id if provided
      if (dto.product_id && productMapById.has(dto.product_id)) {
        return dto.product_id;
      }
      // 5. Default fallback to first active product
      if (allProducts.length > 0) {
        return allProducts[0].id;
      }
      return null;
    };

    let created = 0;
    let totalL = 0;

    await this.dataSource.transaction(async (em) => {
      for (const card of cards) {
        const targetProductId = resolveCardProductId(card);
        if (!targetProductId) continue;

        const allocL = dto.default_l !== undefined && dto.default_l !== null
          ? Number(dto.default_l)
          : (toNum(card.monthlyLimit) > 0 ? toNum(card.monthlyLimit) : 200);

        const existingQuota = await em.findOne(CardQuota, {
          where: {
            cardId: card.id,
            periodId,
            productId: targetProductId,
          },
        });

        if (!existingQuota) {
          const qId = uuid();
          const newQuota = em.create(CardQuota, {
            id: qId,
            cardId: card.id,
            periodId,
            productId: targetProductId,
            allocatedL: allocL,
            usedL: 0,
            remainingL: allocL,
            status: 'ACTIVE',
          });
          await em.save(CardQuota, newQuota);

          const ledger = em.create(QuotaLedger, {
            id: uuid(),
            quotaId: qId,
            cardId: card.id,
            type: 'ALLOCATION',
            amountL: allocL,
            balanceL: allocL,
            description: `Monthly Allocation ${dto.period}`,
            createdBy: userId,
          });
          await em.save(QuotaLedger, ledger);
          created++;
          totalL += allocL;
        }
      }
    });

    await this.audit.logAudit(
      userId,
      'GENERATE_QUOTA',
      'Quota',
      periodId,
      null,
      { period: dto.period, cards: created, default_l: dto.default_l, total_l: totalL },
      null,
      ip,
    );

    return {
      period_id: periodId,
      cards_processed: cards.length,
      quotas_created: created,
      total_l: totalL,
    };
  }

  async topup(dto: TopupQuotaDto, userId: string, ip?: string) {
    // 1. Find Card by ID or Card Number, including vehicle and vehicle's product
    const card = await this.cardRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.vehicle', 'v')
      .leftJoinAndSelect('v.product', 'vp')
      .where('c.id = :cardId OR c.cardNumber = :cardId', { cardId: dto.card_id })
      .getOne();

    if (!card) {
      throw new NotFoundException({
        success: false,
        message: 'Kartu tidak ditemukan',
      });
    }

    // 2. Resolve Product ID
    let targetProductId = dto.product_id;

    if (!targetProductId) {
      // Auto detect from card vehicle productId
      if (card.vehicle?.productId) {
        targetProductId = card.vehicle.productId;
      } else if (card.fuelType) {
        const ft = card.fuelType.trim();
        const prod = await this.productRepo
          .createQueryBuilder('p')
          .where('p.id = :val OR p.code = :val OR p.name = :val', { val: ft })
          .getOne();
        if (prod) targetProductId = prod.id;
      } else if (card.vehicle?.fuelType) {
        const vft = card.vehicle.fuelType.trim();
        const prod = await this.productRepo
          .createQueryBuilder('p')
          .where('p.id = :val OR p.code = :val OR p.name = :val', { val: vft })
          .getOne();
        if (prod) targetProductId = prod.id;
      }
    }

    // 3. Find active Quota Period
    const activePeriod = await this.quotaPeriodRepo.findOne({
      where: { status: 'ACTIVE' },
      order: { year: 'DESC', month: 'DESC' },
    });

    let quota: CardQuota | null = null;

    if (activePeriod) {
      if (targetProductId) {
        quota = await this.cardQuotaRepo.findOne({
          where: {
            cardId: card.id,
            periodId: activePeriod.id,
            productId: targetProductId,
          },
        });
      }

      if (!quota) {
        // Find any quota record for this card in current active period
        quota = await this.cardQuotaRepo.findOne({
          where: {
            cardId: card.id,
            periodId: activePeriod.id,
          },
          order: { createdAt: 'DESC' },
        });
        if (quota && !targetProductId) {
          targetProductId = quota.productId;
        }
      }
    }

    // Fallback: search most recent quota if active period query found nothing
    if (!quota && !targetProductId) {
      quota = await this.cardQuotaRepo.findOne({
        where: { cardId: card.id },
        order: { createdAt: 'DESC' },
      });
      if (quota) {
        targetProductId = quota.productId;
      }
    }

    // If still no quota exists, but active period and product are available, create new quota on the fly
    if (!quota && activePeriod && targetProductId) {
      const qId = uuid();
      const newQuota = this.cardQuotaRepo.create({
        id: qId,
        cardId: card.id,
        periodId: activePeriod.id,
        productId: targetProductId,
        allocatedL: dto.amount_l,
        usedL: 0,
        remainingL: dto.amount_l,
        topupL: dto.amount_l,
        status: 'ACTIVE',
      });
      await this.cardQuotaRepo.save(newQuota);

      const ledger = this.quotaLedgerRepo.create({
        id: uuid(),
        quotaId: qId,
        cardId: card.id,
        type: 'TOPUP',
        amountL: dto.amount_l,
        balanceL: dto.amount_l,
        description: `Top Up: ${dto.reason}`,
        createdBy: userId,
      });
      await this.quotaLedgerRepo.save(ledger);

      await this.audit.logAudit(
        userId,
        'TOPUP_QUOTA',
        'Quota',
        qId,
        { remaining_l: 0 },
        { remaining_l: dto.amount_l, added_l: dto.amount_l },
        dto.reason,
        ip,
      );

      return {
        quota_id: qId,
        product_id: targetProductId,
        new_remaining_l: dto.amount_l,
      };
    }

    if (!quota) {
      throw new NotFoundException({
        success: false,
        message: 'Kuota kartu tidak ditemukan untuk periode aktif dan produk terkait',
      });
    }

    targetProductId = quota.productId || targetProductId;
    const currentRemaining = toNum(quota.remainingL);
    const newRemaining = currentRemaining + dto.amount_l;
    const quotaId = quota.id;

    await this.dataSource.transaction(async (em) => {
      await em
        .createQueryBuilder()
        .update(CardQuota)
        .set({
          remainingL: () => `remaining_l + ${dto.amount_l}`,
          topupL: () => `topup_l + ${dto.amount_l}`,
          allocatedL: () => `allocated_l + ${dto.amount_l}`,
        })
        .where('id = :id', { id: quotaId })
        .execute();

      const ledger = em.create(QuotaLedger, {
        id: uuid(),
        quotaId: quotaId,
        cardId: card.id,
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
      quotaId,
      { remaining_l: currentRemaining },
      { remaining_l: newRemaining, added_l: dto.amount_l },
      dto.reason,
      ip,
    );

    return {
      quota_id: quotaId,
      product_id: targetProductId,
      new_remaining_l: newRemaining,
    };
  }
}
