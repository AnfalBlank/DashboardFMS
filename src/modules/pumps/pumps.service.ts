import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Pump,
  Nozzle,
  Product,
  Totalizer,
  Transaction,
} from '../../database/entities';
import { AuditService } from '../audit/audit.service';
import { v4 as uuid } from 'uuid';
import { CreatePumpDto } from './dto/create-pump.dto';
import { UpdatePumpDto } from './dto/update-pump.dto';
import { CreateNozzleDto } from './dto/create-nozzle.dto';
import { UpdateNozzleDto } from './dto/update-nozzle.dto';
import { TotalizerReadingDto } from './dto/totalizer-reading.dto';
import { toNum } from '../../common/utils/db.util';

@Injectable()
export class PumpsService {
  constructor(
    @InjectRepository(Pump)
    private readonly pumpRepo: Repository<Pump>,
    @InjectRepository(Nozzle)
    private readonly nozzleRepo: Repository<Nozzle>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Totalizer)
    private readonly totalizerRepo: Repository<Totalizer>,
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
    private readonly audit: AuditService,
  ) {}

  // ══════════════ PUMPS ══════════════

  async getPumps() {
    const list = await this.pumpRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.nozzles', 'n')
      .leftJoinAndSelect('n.product', 'pr')
      .orderBy('p.number', 'ASC')
      .getMany();

    return list.map((p) => ({
      id: p.id,
      number: p.number,
      location: p.location,
      status: p.status,
      active: p.active,
      nozzle_count: p.nozzles?.length ?? 0,
      nozzles: (p.nozzles || []).map((n) => ({
        id: n.id,
        number: n.number,
        product_id: n.productId,
        product_name: n.product?.name,
        status: n.status,
      })),
      created_at: p.createdAt,
    }));
  }

  async getPump(id: string) {
    const p = await this.pumpRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.nozzles', 'n')
      .leftJoinAndSelect('n.product', 'pr')
      .where('p.id = :id', { id })
      .getOne();

    if (!p) {
      throw new NotFoundException({
        success: false,
        message: `Pompa dispenser dengan ID '${id}' tidak ditemukan`,
      });
    }

    return {
      id: p.id,
      number: p.number,
      location: p.location,
      status: p.status,
      active: p.active,
      nozzle_count: p.nozzles?.length ?? 0,
      nozzles: (p.nozzles || []).map((n) => ({
        id: n.id,
        number: n.number,
        product_id: n.productId,
        product_name: n.product?.name,
        status: n.status,
      })),
      created_at: p.createdAt,
    };
  }

  async createPump(dto: CreatePumpDto, userId?: string, ip?: string) {
    const pumpNumber = dto.number.trim();
    const existing = await this.pumpRepo.findOneBy({ number: pumpNumber });
    if (existing) {
      throw new ConflictException({
        success: false,
        message: `Pompa dispenser dengan nomor '${pumpNumber}' sudah terdaftar`,
      });
    }

    const pumpId = dto.id?.trim() || `PUMP-${pumpNumber.padStart(2, '0')}`;
    const existingId = await this.pumpRepo.findOneBy({ id: pumpId });
    if (existingId) {
      throw new ConflictException({
        success: false,
        message: `Pompa dispenser dengan ID '${pumpId}' sudah ada`,
      });
    }

    const pump = this.pumpRepo.create({
      id: pumpId,
      number: pumpNumber,
      location: dto.location?.trim() || undefined,
      status: dto.status || 'ACTIVE',
      active: dto.active !== undefined ? Number(dto.active) : 1,
    });

    await this.pumpRepo.save(pump);

    await this.audit.logAudit(
      userId,
      'CREATE_PUMP',
      'Pump',
      pumpId,
      null,
      dto,
      'Registrasi pompa dispenser baru',
      ip,
    );

    return this.getPump(pumpId);
  }

  async updatePump(id: string, dto: UpdatePumpDto, userId?: string, ip?: string) {
    const before = await this.getPump(id);

    const updateData: Partial<Pump> = {};
    if (dto.number !== undefined) {
      const pumpNum = dto.number.trim();
      if (pumpNum !== before.number) {
        const existing = await this.pumpRepo.findOneBy({ number: pumpNum });
        if (existing && existing.id !== id) {
          throw new ConflictException({
            success: false,
            message: `Nomor dispenser '${pumpNum}' sudah digunakan oleh pompa lain`,
          });
        }
        updateData.number = pumpNum;
      }
    }

    if (dto.location !== undefined) updateData.location = dto.location.trim();
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.active !== undefined) updateData.active = Number(dto.active);

    await this.pumpRepo.update(id, updateData);

    await this.audit.logAudit(
      userId,
      'UPDATE_PUMP',
      'Pump',
      id,
      before,
      dto,
      'Update data pompa dispenser',
      ip,
    );

    const updated = await this.getPump(id);
    return { message: 'Pompa dispenser berhasil diperbarui', data: updated };
  }

  async deletePump(id: string, userId?: string, ip?: string) {
    const before = await this.getPump(id);

    // Delete associated nozzles or cascade
    await this.nozzleRepo.delete({ pumpId: id });
    await this.pumpRepo.delete(id);

    await this.audit.logAudit(
      userId,
      'DELETE_PUMP',
      'Pump',
      id,
      before,
      null,
      'Hapus pompa dispenser',
      ip,
    );

    return { success: true, message: `Pompa dispenser '${before.number}' berhasil dihapus` };
  }

  // ══════════════ NOZZLES ══════════════

  async getNozzles() {
    const list = await this.nozzleRepo
      .createQueryBuilder('n')
      .innerJoinAndSelect('n.pump', 'p')
      .innerJoinAndSelect('n.product', 'pr')
      .orderBy('p.number', 'ASC')
      .addOrderBy('n.number', 'ASC')
      .getMany();

    return list.map((n) => ({
      id: n.id,
      number: n.number,
      pump_id: n.pumpId,
      pump_number: n.pump?.number,
      location: n.pump?.location,
      product_id: n.productId,
      product_name: n.product?.name,
      product_code: n.product?.code,
      status: n.status,
      created_at: n.createdAt,
    }));
  }

  async getNozzle(id: string) {
    const n = await this.nozzleRepo
      .createQueryBuilder('n')
      .innerJoinAndSelect('n.pump', 'p')
      .innerJoinAndSelect('n.product', 'pr')
      .where('n.id = :id', { id })
      .getOne();

    if (!n) {
      throw new NotFoundException({
        success: false,
        message: `Nozzle dengan ID '${id}' tidak ditemukan`,
      });
    }

    return {
      id: n.id,
      number: n.number,
      pump_id: n.pumpId,
      pump_number: n.pump?.number,
      location: n.pump?.location,
      product_id: n.productId,
      product_name: n.product?.name,
      product_code: n.product?.code,
      status: n.status,
      created_at: n.createdAt,
    };
  }

  async createNozzle(dto: CreateNozzleDto, userId?: string, ip?: string) {
    const pump = await this.pumpRepo.findOneBy({ id: dto.pump_id });
    if (!pump) {
      throw new NotFoundException({
        success: false,
        message: `Pompa dispenser dengan ID '${dto.pump_id}' tidak ditemukan`,
      });
    }

    const product = await this.productRepo.findOneBy({ id: dto.product_id });
    if (!product) {
      throw new NotFoundException({
        success: false,
        message: `Produk BBM dengan ID '${dto.product_id}' tidak ditemukan`,
      });
    }

    const nozzleNum = dto.number.trim();
    const existing = await this.nozzleRepo.findOne({
      where: { pumpId: dto.pump_id, number: nozzleNum },
    });
    if (existing) {
      throw new ConflictException({
        success: false,
        message: `Nozzle nomor '${nozzleNum}' sudah ada pada Dispenser '${pump.number}'`,
      });
    }

    const nozzleId = dto.id?.trim() || `NOZZLE-${pump.number}-${nozzleNum}`;
    const existingId = await this.nozzleRepo.findOneBy({ id: nozzleId });
    if (existingId) {
      throw new ConflictException({
        success: false,
        message: `Nozzle dengan ID '${nozzleId}' sudah ada`,
      });
    }

    const nozzle = this.nozzleRepo.create({
      id: nozzleId,
      number: nozzleNum,
      pumpId: dto.pump_id,
      productId: dto.product_id,
      status: dto.status || 'ACTIVE',
    });

    await this.nozzleRepo.save(nozzle);

    await this.audit.logAudit(
      userId,
      'CREATE_NOZZLE',
      'Nozzle',
      nozzleId,
      null,
      dto,
      'Registrasi nozzle dispenser baru',
      ip,
    );

    return this.getNozzle(nozzleId);
  }

  async updateNozzle(id: string, dto: UpdateNozzleDto, userId?: string, ip?: string) {
    const before = await this.getNozzle(id);

    const updateData: Partial<Nozzle> = {};

    if (dto.pump_id) {
      const pump = await this.pumpRepo.findOneBy({ id: dto.pump_id });
      if (!pump) {
        throw new NotFoundException({
          success: false,
          message: `Pompa dispenser dengan ID '${dto.pump_id}' tidak ditemukan`,
        });
      }
      updateData.pumpId = dto.pump_id;
    }

    if (dto.product_id) {
      const product = await this.productRepo.findOneBy({ id: dto.product_id });
      if (!product) {
        throw new NotFoundException({
          success: false,
          message: `Produk BBM dengan ID '${dto.product_id}' tidak ditemukan`,
        });
      }
      updateData.productId = dto.product_id;
    }

    if (dto.number !== undefined) {
      const nozzleNum = dto.number.trim();
      const targetPumpId = dto.pump_id || before.pump_id;
      const existing = await this.nozzleRepo.findOne({
        where: { pumpId: targetPumpId, number: nozzleNum },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException({
          success: false,
          message: `Nozzle nomor '${nozzleNum}' sudah ada pada dispenser terkait`,
        });
      }
      updateData.number = nozzleNum;
    }

    if (dto.status !== undefined) updateData.status = dto.status;

    await this.nozzleRepo.update(id, updateData);

    await this.audit.logAudit(
      userId,
      'UPDATE_NOZZLE',
      'Nozzle',
      id,
      before,
      dto,
      'Update data nozzle dispenser',
      ip,
    );

    const updated = await this.getNozzle(id);
    return { message: 'Nozzle berhasil diperbarui', data: updated };
  }

  async deleteNozzle(id: string, userId?: string, ip?: string) {
    const before = await this.getNozzle(id);

    await this.nozzleRepo.delete(id);

    await this.audit.logAudit(
      userId,
      'DELETE_NOZZLE',
      'Nozzle',
      id,
      before,
      null,
      'Hapus nozzle dispenser',
      ip,
    );

    return { success: true, message: `Nozzle '${before.number}' pada Dispenser '${before.pump_number}' berhasil dihapus` };
  }

  // ══════════════ TOTALIZERS & RECONCILIATION ══════════════

  async getTotalizers(date?: string) {
    const targetDate = date ?? new Date().toISOString().slice(0, 10);

    const list = await this.totalizerRepo
      .createQueryBuilder('t')
      .innerJoinAndSelect('t.nozzle', 'n')
      .innerJoinAndSelect('n.pump', 'pm')
      .innerJoinAndSelect('n.product', 'pr')
      .where('t.shiftDate = :targetDate', { targetDate })
      .orderBy('pm.number', 'ASC')
      .addOrderBy('n.number', 'ASC')
      .getMany();

    const results = [];
    for (const t of list) {
      const salesRaw = await this.txRepo
        .createQueryBuilder('tx')
        .select('COALESCE(SUM(tx.volume_l), 0)', 'system_sales')
        .where('tx.nozzleId = :nozzleId AND DATE(tx.transactionTime) = :targetDate AND tx.status = :status', {
          nozzleId: t.nozzleId,
          targetDate,
          status: 'SUCCESS',
        })
        .getRawOne();

      const openVal = toNum(t.openingValue);
      const currVal = toNum(t.currentValue);
      const systemSales = toNum(salesRaw?.system_sales);

      results.push({
        id: t.id,
        nozzle_id: t.nozzleId,
        nozzle_number: t.nozzle?.number,
        product_id: t.nozzle?.productId,
        product_name: t.nozzle?.product?.name,
        pump_number: t.nozzle?.pump?.number,
        opening_value: openVal,
        current_value: currVal,
        closing_value: toNum(t.closingValue),
        shift_date: t.shiftDate,
        shift: t.shift,
        actual_dispensed: currVal - openVal,
        system_sales: systemSales,
        created_at: t.createdAt,
        updated_at: t.updatedAt,
      });
    }

    return results;
  }

  async saveTotalizer(dto: TotalizerReadingDto) {
    const existing = await this.totalizerRepo.findOne({
      where: {
        nozzleId: dto.nozzle_id,
        shiftDate: dto.shift_date,
        shift: dto.shift ?? 'PAGI',
      },
    });

    if (existing) {
      await this.totalizerRepo.update(existing.id, {
        currentValue: dto.current_value,
      });
      return { id: existing.id, updated: true };
    } else {
      const id = uuid();
      const newTotalizer = this.totalizerRepo.create({
        id,
        nozzleId: dto.nozzle_id,
        openingValue: dto.opening_value,
        currentValue: dto.current_value,
        shiftDate: dto.shift_date,
        shift: dto.shift ?? 'PAGI',
      });
      await this.totalizerRepo.save(newTotalizer);
      return { id, updated: false };
    }
  }

  async getPumpReconciliation(date?: string) {
    const targetDate = date ?? new Date().toISOString().slice(0, 10);

    const nozzles = await this.nozzleRepo
      .createQueryBuilder('n')
      .innerJoinAndSelect('n.pump', 'pm')
      .innerJoinAndSelect('n.product', 'pr')
      .orderBy('pm.number', 'ASC')
      .addOrderBy('n.number', 'ASC')
      .getMany();

    const results = [];
    for (const n of nozzles) {
      const totalizer = await this.totalizerRepo.findOne({
        where: {
          nozzleId: n.id,
          shiftDate: targetDate,
        },
      });

      const salesRaw = await this.txRepo
        .createQueryBuilder('tx')
        .select('COALESCE(SUM(tx.volume_l), 0)', 'system_sales')
        .where('tx.nozzleId = :nozzleId AND DATE(tx.transactionTime) = :targetDate AND tx.status = :status', {
          nozzleId: n.id,
          targetDate,
          status: 'SUCCESS',
        })
        .getRawOne();

      const openVal = toNum(totalizer?.openingValue);
      const currVal = toNum(totalizer?.currentValue);
      const totalizerUsage = currVal - openVal;
      const systemSales = toNum(salesRaw?.system_sales);
      const variance = totalizerUsage - systemSales;

      results.push({
        nozzle_id: n.id,
        nozzle_number: n.number,
        pump_number: n.pump?.number,
        product_name: n.product?.name,
        totalizer_usage: totalizerUsage,
        system_sales: systemSales,
        variance_l: variance,
      });
    }

    return results;
  }
}
