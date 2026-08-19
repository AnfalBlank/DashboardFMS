import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Card,
  Transaction,
  CardQuota,
  Vehicle,
} from '../../database/entities';
import { AuditService } from '../audit/audit.service';
import { v4 as uuid } from 'uuid';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { toNum } from '../../common/utils/db.util';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepo: Repository<Card>,
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
    @InjectRepository(CardQuota)
    private readonly cardQuotaRepo: Repository<CardQuota>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    private readonly audit: AuditService,
  ) {}

  async findAll(
    search?: string,
    status?: string,
    unit?: string,
    limit: number = 100,
    offset: number = 0,
  ) {
    const qb = this.cardRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.unit', 'u')
      .leftJoinAndSelect('c.vehicle', 'v')
      .leftJoinAndSelect('v.product', 'vp');

    if (search) {
      qb.andWhere(
        '(c.cardNumber LIKE :search OR c.holderName LIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (status) {
      qb.andWhere('c.status = :status', { status });
    }
    if (unit) {
      qb.andWhere('c.unitId = :unit', { unit });
    }

    qb.orderBy('c.cardNumber', 'ASC').take(Number(limit)).skip(Number(offset));

    const [rows, total] = await qb.getManyAndCount();

    const data = rows.map((c) => ({
      id: c.id,
      card_number: c.cardNumber,
      card_type: c.cardType,
      status: c.status,
      holder_name: c.holderName,
      unit_id: c.unitId,
      unit_name: c.unit?.name,
      vehicle_id: c.vehicleId,
      police_number: c.vehicle?.policeNumber,
      brand: c.vehicle?.brand,
      model: c.vehicle?.model,
      product_id: c.vehicle?.productId,
      product_name: c.vehicle?.product?.name,
      fuel_type: c.vehicle?.product?.name ?? c.vehicle?.fuelType ?? c.fuelType,
      monthly_limit: toNum(c.monthlyLimit),
      expiry_date: c.expiryDate,
      activation_date: c.activationDate,
      rfid_uid: c.rfidUid,
      notes: c.notes,
      created_at: c.createdAt,
      updated_at: c.updatedAt,
    }));

    return { data, meta: { total } };
  }

  async findOne(id: string) {
    const c = await this.cardRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.unit', 'u')
      .leftJoinAndSelect('c.vehicle', 'v')
      .leftJoinAndSelect('v.product', 'vp')
      .where('c.id = :id OR c.cardNumber = :id', { id })
      .getOne();

    if (!c) {
      throw new NotFoundException({
        success: false,
        message: 'Kartu tidak ditemukan',
      });
    }

    return {
      id: c.id,
      card_number: c.cardNumber,
      card_type: c.cardType,
      status: c.status,
      holder_name: c.holderName,
      unit_id: c.unitId,
      unit_name: c.unit?.name,
      vehicle_id: c.vehicleId,
      police_number: c.vehicle?.policeNumber,
      brand: c.vehicle?.brand,
      model: c.vehicle?.model,
      year: c.vehicle?.year,
      product_id: c.vehicle?.productId,
      product_name: c.vehicle?.product?.name,
      fuel_type: c.vehicle?.product?.name ?? c.vehicle?.fuelType ?? c.fuelType,
      monthly_limit: toNum(c.monthlyLimit),
      expiry_date: c.expiryDate,
      activation_date: c.activationDate,
      rfid_uid: c.rfidUid,
      notes: c.notes,
      created_at: c.createdAt,
      updated_at: c.updatedAt,
    };
  }

  async findTransactions(id: string, limit: number = 20, offset: number = 0) {
    const list = await this.txRepo
      .createQueryBuilder('t')
      .innerJoin('t.card', 'c')
      .innerJoinAndSelect('t.product', 'p')
      .leftJoinAndSelect('t.nozzle', 'n')
      .leftJoinAndSelect('t.pump', 'pm')
      .where('c.id = :id OR c.cardNumber = :id', { id })
      .orderBy('t.transactionTime', 'DESC')
      .take(Number(limit))
      .skip(Number(offset))
      .getMany();

    return list.map((t) => ({
      id: t.id,
      card_id: t.cardId,
      product_id: t.productId,
      product_name: t.product?.name,
      nozzle_id: t.nozzleId,
      nozzle_number: t.nozzle?.number,
      pump_id: t.pumpId,
      pump_number: t.pump?.number,
      shift: t.shift,
      volume_l: toNum(t.volumeL),
      price_per_unit: toNum(t.pricePerUnit),
      total_amount: toNum(t.totalAmount),
      quota_before: toNum(t.quotaBefore),
      quota_deducted: toNum(t.quotaDeducted),
      quota_after: toNum(t.quotaAfter),
      status: t.status,
      source: t.source,
      transaction_time: t.transactionTime,
    }));
  }

  async findQuota(id: string) {
    const list = await this.cardQuotaRepo
      .createQueryBuilder('cq')
      .innerJoin('cq.card', 'c')
      .innerJoinAndSelect('cq.period', 'qp')
      .innerJoinAndSelect('cq.product', 'p')
      .where('c.id = :id OR c.cardNumber = :id', { id })
      .orderBy('qp.year', 'DESC')
      .addOrderBy('qp.month', 'DESC')
      .getMany();

    return list.map((cq) => ({
      id: cq.id,
      card_id: cq.cardId,
      period_id: cq.periodId,
      period: cq.period?.period,
      year: cq.period?.year,
      month: cq.period?.month,
      period_status: cq.period?.status,
      product_id: cq.productId,
      product_name: cq.product?.name,
      allocated_l: toNum(cq.allocatedL),
      used_l: toNum(cq.usedL),
      remaining_l: toNum(cq.remainingL),
      topup_l: toNum(cq.topupL),
      expired_l: toNum(cq.expiredL),
      status: cq.status,
    }));
  }

  async create(dto: CreateCardDto, userId: string, ip?: string) {
    const id = uuid();
    let fuelType = dto.fuel_type ?? undefined;
    let unitId = dto.unit_id ?? undefined;

    if (dto.vehicle_id) {
      const veh = await this.vehicleRepo.findOne({
        where: { id: dto.vehicle_id },
        relations: ['product'],
      });
      if (veh) {
        fuelType = veh.product?.name ?? veh.fuelType ?? fuelType;
        if (!unitId && veh.unitId) {
          unitId = veh.unitId;
        }
      }
    }

    const card = this.cardRepo.create({
      id,
      cardNumber: dto.card_number,
      cardType: dto.card_type ?? 'REGULER',
      holderName: dto.holder_name,
      unitId,
      vehicleId: dto.vehicle_id ?? undefined,
      fuelType,
      monthlyLimit: dto.monthly_limit ?? 200,
      expiryDate: dto.expiry_date ?? undefined,
      activationDate: dto.activation_date ?? undefined,
      rfidUid: dto.rfid_uid ?? undefined,
      notes: dto.notes ?? undefined,
    });

    await this.cardRepo.save(card);

    await this.audit.logAudit(
      userId,
      'CREATE_CARD',
      'Card',
      id,
      null,
      dto,
      null,
      ip,
    );

    return { id };
  }

  async update(id: string, dto: UpdateCardDto, userId: string, ip?: string) {
    const before = await this.cardRepo.findOneBy({ id });
    if (!before) {
      throw new NotFoundException({
        success: false,
        message: 'Kartu tidak ditemukan',
      });
    }

    const updateData: Partial<Card> = {};
    if (dto.holder_name !== undefined) updateData.holderName = dto.holder_name;
    if (dto.unit_id !== undefined) updateData.unitId = dto.unit_id;
    if (dto.monthly_limit !== undefined) updateData.monthlyLimit = dto.monthly_limit;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    if (dto.vehicle_id !== undefined) {
      updateData.vehicleId = dto.vehicle_id || (null as any);
      if (dto.vehicle_id) {
        const veh = await this.vehicleRepo.findOne({
          where: { id: dto.vehicle_id },
          relations: ['product'],
        });
        if (veh) {
          updateData.fuelType = veh.product?.name ?? veh.fuelType;
        }
      }
    }

    if (dto.fuel_type !== undefined && updateData.fuelType === undefined) {
      updateData.fuelType = dto.fuel_type;
    }

    await this.cardRepo.update(id, updateData);

    await this.audit.logAudit(
      userId,
      'UPDATE_CARD',
      'Card',
      id,
      before,
      dto,
      null,
      ip,
    );

    return { message: 'Kartu berhasil diperbarui' };
  }

  async block(id: string, reason?: string, userId?: string, ip?: string) {
    const before = await this.cardRepo.findOneBy({ id });
    if (!before) {
      throw new NotFoundException({
        success: false,
        message: 'Kartu tidak ditemukan',
      });
    }

    await this.cardRepo.update(id, { status: 'BLOCKED' });

    await this.audit.logAudit(
      userId,
      'BLOCK_CARD',
      'Card',
      id,
      { status: before.status },
      { status: 'BLOCKED' },
      reason,
      ip,
    );

    return { message: 'Kartu berhasil diblokir' };
  }

  async unblock(id: string, reason?: string, userId?: string, ip?: string) {
    await this.cardRepo.update(id, { status: 'ACTIVE' });

    await this.audit.logAudit(
      userId,
      'UNBLOCK_CARD',
      'Card',
      id,
      { status: 'BLOCKED' },
      { status: 'ACTIVE' },
      reason,
      ip,
    );

    return { message: 'Kartu berhasil diaktifkan' };
  }
}
