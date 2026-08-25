import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
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
  Pump,
  Nozzle,
  SystemSetting,
} from '../../database/entities';
import { AuditService } from '../audit/audit.service';
import { PumpsService } from '../pumps/pumps.service';
import { toNum } from '../../common/utils/db.util';
import { v4 as uuid } from 'uuid';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreatePresetDto } from './dto/create-preset.dto';
import { ENABLER_DB_CONNECTION, EnablerPresetHistory, EnablerPresetOrder, EnablerSettingPump } from 'src/database/enabler';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

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
    @InjectRepository(Nozzle)
    private readonly nozzleRepo: Repository<Nozzle>,
    private readonly dataSource: DataSource,
    private readonly audit: AuditService,
    private readonly pumpsService: PumpsService,

    @InjectRepository(EnablerPresetOrder, ENABLER_DB_CONNECTION)
    private readonly enablerPresetOrderRepo: Repository<EnablerPresetOrder>,
    @InjectRepository(EnablerPresetHistory, ENABLER_DB_CONNECTION)
    private readonly enablerPresetHistoryRepo: Repository<EnablerPresetHistory>,
    @InjectRepository(EnablerSettingPump, ENABLER_DB_CONNECTION)
    private readonly enablerSettingPumpRepo: Repository<EnablerSettingPump>,
  ) { }

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
    const card = await this.cardRepo.findOne({
      where: { cardNumber: dto.card_number },
      relations: ['unit', 'vehicle'],
    });
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

    if (dto.pump_id) {
      const pump = await this.dataSource.getRepository(Pump).findOneBy({ id: dto.pump_id });
      if (pump && pump.status !== 'IDLE') {
        throw new BadRequestException({
          success: false,
          message: `Pompa dispenser ${pump.number || dto.pump_id} sedang berstatus '${pump.status}'. Transaksi hanya dapat diproses saat dispenser berstatus IDLE.`,
        });
      }
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
          description: 'Fuel Transaction POS',
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
      {
        card_number: card.cardNumber,
        volume: dto.volume_l,
        product_id: dto.product_id,
        pump_id: dto.pump_id,
      },
      `Pencatatan transaksi POS ${dto.volume_l} L`,
      ip,
    );

    return {
      id: txId,
      status: txStatus,
      quota_after: quotaAfter,
      data: {
        id: txId,
        card_number: card.cardNumber,
        holder_name: card.holderName,
        unit_name: card.unit?.name,
        police_number: card.vehicle?.policeNumber,
        volume_l: dto.volume_l,
        price_per_unit: price,
        total_amount: total,
        quota_before: quotaBefore,
        quota_deducted: quotaDeducted,
        quota_after: quotaAfter,
        status: txStatus,
        transaction_time: new Date().toISOString(),
      },
    };
  }

  async createPreset(dto: CreatePresetDto, userId: string, ip?: string) {
    const card = await this.cardRepo.findOne({
      where: { cardNumber: dto.card_number },
      relations: ['unit', 'vehicle'],
    });
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
    }

    if (!dto.pump_id) {
      throw new BadRequestException({
        success: false,
        message: 'Dispenser pompa wajib dipilih untuk pengisian',
      });
    }

    const pump = await this.dataSource.getRepository(Pump).findOneBy({ id: dto.pump_id });
    if (!pump) {
      throw new NotFoundException({
        success: false,
        message: `Pompa dispenser dengan ID '${dto.pump_id}' tidak ditemukan`,
      });
    }

    if (pump.status !== 'IDLE') {
      throw new BadRequestException({
        success: false,
        message: `Pompa dispenser ${pump.number || dto.pump_id} sedang berstatus '${pump.status}'. Preset hanya dapat diproses saat dispenser berstatus IDLE.`,
      });
    }

    if (pump.presetStatus === 'SET' || pump.presetStatus === 'ACTIVE') {
      throw new BadRequestException({
        success: false,
        message: `Dispenser ${pump.number} sudah memiliki preset aktif (${pump.presetStatus}). Selesaikan atau batalkan pengisian sebelumnya.`,
      });
    }

    // Resolve nozzle
    const nozzle = await this.nozzleRepo.findOne({ where: { id: dto.nozzle_id }, relations: ['product'] });
    if (!nozzle) {
      throw new NotFoundException({
        success: false,
        message: `Nozzle dengan ID '${dto.nozzle_id}' tidak ditemukan`,
      });
    }


    const product = nozzle.product

    const price = await this.getActivePrice(dto.product_id);
    const total = price * dto.volume_l;

    // Dispatch preset to FMS Controller (0-based pump index: targetPumpNo - 1)
    const targetPumpNo = pump.idPumpEnabler ?? (parseInt(pump.number, 10) || 1);
    // const targetPumpIndex = Math.max(0, targetPumpNo - 1);
    const policeNumber = card.vehicle?.policeNumber ?? '';


    let presetHistory: EnablerPresetHistory | undefined;
    const enablerPumpId = pump.idPumpEnabler ?? parseInt(pump.number, 10);
    try {
      const checkPreset = await this.enablerPresetOrderRepo.findOneBy({ id_pump: enablerPumpId });
      if (checkPreset && checkPreset.preset_flag === 1) {
        await this.pumpsService.updatePump(pump.id, { preset_status: 'SET' }, userId, ip);
        throw new BadRequestException({
          success: false,
          message: `Dispenser ${pump.number} sudah memiliki preset aktif di Enabler.`,
        });
      }

      presetHistory = this.enablerPresetHistoryRepo.create({
        id_pump: enablerPumpId,
        preset_type: 1,
        preset_value: dto.volume_l.toString(),
        product_name: product?.name || '',
        waktu_preset: new Date(),
        waktu_batal: new Date(Date.UTC(0, 0, 0, 0, 0, 0)),
        keterangan: 'preset',
        ip_address: ip,
        user_name: 'POS',
      });
      await this.enablerPresetHistoryRepo.save(presetHistory);

      await this.enablerPresetOrderRepo.update({ id_pump: enablerPumpId }, {
        id_preset: presetHistory.id.toString(),
        preset_type: presetHistory.preset_type,
        preset_value: presetHistory.preset_value,
        product_name: product?.name || '',
        preset_time: new Date().toISOString(),
        preset_flag: 1,
      });

      await this.enablerSettingPumpRepo.update({ id_pump: enablerPumpId }, {
        auth_flag: 0,
      })
      this.logger.log(`preset pump ${pump.number} berhasil disetel ke Enabler`)
    } catch (fmsErr: any) {
      console.log(fmsErr);
      this.logger.warn(
        `Could not dispatch preset to FMS Controller: ${fmsErr?.message || fmsErr}`,
      );
    }

    // Update pump preset status to SET
    await this.pumpsService.updatePump(pump.id, {
      preset_status: 'SET',
    });

    await this.audit.logAudit(
      userId,
      'SET_PUMP_PRESET',
      'Pump',
      pump.id,
      { status: pump.status, presetStatus: pump.presetStatus },
      {
        card_number: card.cardNumber,
        holder_name: card.holderName,
        police_number: policeNumber,
        volume_l: dto.volume_l,
        total_amount: total,
        presetHistory,
      },
      `Set preset ${dto.volume_l} L ke Dispenser ${pump.number} via POS`,
      ip,
    );

    return {
      id: `PRESET-${pump.number}-${Date.now()}`,
      message: `Preset dispenser ${pump.number} (${dto.volume_l} L) berhasil disetel ke FMS Controller. Silakan angkat nozzle untuk pengisian BBM.`,
      pump_id: pump.id,
      pump_number: pump.number,
      preset_status: 'SET',
      volume_l: dto.volume_l,
      price_per_unit: price,
      total_amount: total,
      card_number: card.cardNumber,
      holder_name: card.holderName,
      police_number: policeNumber,
      unit_name: card.unit?.name,
      quota_remaining: quotaBefore,
    };
  }

  async cancelPreset(pumpId: string, userId?: string, ip?: string) {
    const pump = await this.dataSource.getRepository(Pump).findOneBy({ id: pumpId });
    if (!pump) {
      throw new NotFoundException({
        success: false,
        message: `Pompa dispenser dengan ID '${pumpId}' tidak ditemukan`,
      });
    }

    if (pump.status !== 'IDLE') {
      throw new BadRequestException({
        success: false,
        message: `Dispenser ${pump.number} sedang berstatus '${pump.status}'. Preset hanya dapat dibatalkan saat dispenser IDLE (nozzle belum diangkat).`,
      });
    }

    const enablerPumpId = pump.idPumpEnabler ?? parseInt(pump.number, 10);
    try {
      const order = await this.enablerPresetOrderRepo.findOneBy({ id_pump: enablerPumpId });
      if (order) {
        await this.enablerPresetOrderRepo.update(
          { id_pump: enablerPumpId },
          {
            preset_flag: 0,
          },
        );

        if (order.id_preset) {
          const presetIdNum = parseInt(order.id_preset, 10);
          if (!isNaN(presetIdNum)) {
            await this.enablerPresetHistoryRepo.update(
              { id: presetIdNum },
              {
                waktu_batal: new Date(),
                keterangan: 'batal',
                type_pot: 0,
              },
            );
          }
        }
      }
    } catch (err: any) {
      this.logger.warn(`Gagal membatalkan preset order di Enabler: ${err?.message || err}`);
    }

    await this.pumpsService.updatePump(
      pump.id,
      { preset_status: 'NONE' },
      userId,
      ip,
    );

    await this.audit.logAudit(
      userId,
      'CANCEL_PUMP_PRESET',
      'Pump',
      pump.id,
      { presetStatus: pump.presetStatus, status: pump.status },
      { preset_status: 'NONE' },
      `Pembatalan preset pada Dispenser ${pump.number}`,
      ip,
    );

    return {
      success: true,
      message: `Preset pada Dispenser ${pump.number} berhasil dibatalkan.`,
      pump_id: pump.id,
      pump_number: pump.number,
      preset_status: 'NONE',
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
