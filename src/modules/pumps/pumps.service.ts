import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Pump,
  Nozzle,
  Totalizer,
  Transaction,
} from '../../database/entities';
import { v4 as uuid } from 'uuid';
import { TotalizerReadingDto } from './dto/totalizer-reading.dto';
import { toNum } from '../../common/utils/db.util';

@Injectable()
export class PumpsService {
  constructor(
    @InjectRepository(Pump)
    private readonly pumpRepo: Repository<Pump>,
    @InjectRepository(Nozzle)
    private readonly nozzleRepo: Repository<Nozzle>,
    @InjectRepository(Totalizer)
    private readonly totalizerRepo: Repository<Totalizer>,
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
  ) {}

  async getPumps() {
    const list = await this.pumpRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.nozzles', 'n')
      .orderBy('p.number', 'ASC')
      .getMany();

    return list.map((p) => ({
      id: p.id,
      number: p.number,
      location: p.location,
      status: p.status,
      active: p.active,
      nozzle_count: p.nozzles?.length ?? 0,
      created_at: p.createdAt,
    }));
  }

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
      status: n.status,
      created_at: n.createdAt,
    }));
  }

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
