import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Tank,
  TankReading,
  Notification,
} from '../../database/entities';
import { AuditService } from '../audit/audit.service';
import { toNum } from '../../common/utils/db.util';
import { v4 as uuid } from 'uuid';
import { TankReadingDto } from './dto/tank-reading.dto';
import { UpdateTankDto } from './dto/update-tank.dto';

@Injectable()
export class TanksService {
  constructor(
    @InjectRepository(Tank)
    private readonly tankRepo: Repository<Tank>,
    @InjectRepository(TankReading)
    private readonly tankReadingRepo: Repository<TankReading>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly audit: AuditService,
  ) { }

  async findAll() {
    const list = await this.tankRepo
      .createQueryBuilder('t')
      .innerJoinAndSelect('t.product', 'p')
      .orderBy('p.name', 'ASC')
      .getMany();

    return list.map((t) => ({
      id: t.id,
      product_id: t.productId,
      product_name: t.product?.name,
      product_code: t.product?.code,
      capacity_l: toNum(t.capacityL),
      current_l: toNum(t.currentL),
      status: t.status,
      threshold_low: toNum(t.thresholdLow),
      threshold_critical: toNum(t.thresholdCritical),
      threshold_high: toNum(t.thresholdHigh),
      last_reading_at: t.lastReadingAt,
      created_at: t.createdAt,
      updated_at: t.updatedAt,
    }));
  }

  async findOne(id: string) {
    const t = await this.tankRepo
      .createQueryBuilder('t')
      .innerJoinAndSelect('t.product', 'p')
      .where('t.id = :id', { id })
      .getOne();

    if (!t) {
      throw new NotFoundException({
        success: false,
        message: 'Tank tidak ditemukan',
      });
    }

    return {
      id: t.id,
      product_id: t.productId,
      product_name: t.product?.name,
      capacity_l: toNum(t.capacityL),
      current_l: toNum(t.currentL),
      status: t.status,
      threshold_low: toNum(t.thresholdLow),
      threshold_critical: toNum(t.thresholdCritical),
      threshold_high: toNum(t.thresholdHigh),
      last_reading_at: t.lastReadingAt,
      created_at: t.createdAt,
      updated_at: t.updatedAt,
    };
  }

  async findReadings(id: string, limit: number = 50) {
    const readings = await this.tankReadingRepo.find({
      where: { tankId: id },
      order: { readAt: 'DESC' },
      take: Number(limit),
    });

    return readings.map((r) => ({
      id: r.id,
      tank_id: r.tankId,
      volume_l: toNum(r.volumeL),
      height_cm: toNum(r.heightCm),
      water_level: toNum(r.waterLevel),
      temperature: toNum(r.temperature),
      source: r.source,
      read_at: r.readAt,
      created_by: r.createdBy,
      created_at: r.createdAt,
    }));
  }

  async addReading(id: string, dto: TankReadingDto, userId?: string) {
    const tank = await this.tankRepo.findOneBy({ id });
    if (!tank) {
      throw new NotFoundException({
        success: false,
        message: 'Tank tidak ditemukan',
      });
    }

    const pct = (dto.volume_l / toNum(tank.capacityL, 1)) * 100;
    const thresholdCritical = toNum(tank.thresholdCritical, 15);
    const thresholdLow = toNum(tank.thresholdLow, 30);
    const thresholdHigh = toNum(tank.thresholdHigh, 90);

    const status: 'CRITICAL' | 'LOW' | 'HIGH' | 'NORMAL' =
      pct <= thresholdCritical
        ? 'CRITICAL'
        : pct <= thresholdLow
          ? 'LOW'
          : pct >= thresholdHigh
            ? 'HIGH'
            : 'NORMAL';

    const readAtDate = dto.read_at ? new Date(dto.read_at) : new Date();

    await this.tankRepo.update(id, {
      currentL: dto.volume_l,
      status,
      lastReadingAt: readAtDate,
    });

    const readingId = uuid();
    const reading = this.tankReadingRepo.create({
      id: readingId,
      tankId: id,
      volumeL: dto.volume_l,
      heightCm: dto.height_cm ?? undefined,
      waterLevel: dto.water_level ?? undefined,
      temperature: dto.temperature ?? undefined,
      source: dto.source ?? 'SENSOR',
      readAt: readAtDate,
      createdBy: userId ?? undefined,
    });
    await this.tankReadingRepo.save(reading);

    if (status === 'CRITICAL' || status === 'LOW') {
      const notif = this.notificationRepo.create({
        id: uuid(),
        type: status === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
        title: `Stok ${tank.productId} ${status}`,
        message: `Tank ${id} tersisa ${dto.volume_l.toLocaleString()} L (${pct.toFixed(1)}%)`,
        module: 'inventory',
        refId: id,
      });
      await this.notificationRepo.save(notif);
    }

    return { id: readingId, status, pct: Math.round(pct) };
  }

  async update(id: string, dto: UpdateTankDto, userId?: string, ip?: string) {
    const updateData: Partial<Tank> = {};
    if (dto.capacity_l !== undefined) updateData.capacityL = dto.capacity_l;
    if (dto.current_l !== undefined) updateData.currentL = dto.current_l;
    if (dto.threshold_low !== undefined) updateData.thresholdLow = dto.threshold_low;
    if (dto.threshold_critical !== undefined) updateData.thresholdCritical = dto.threshold_critical;
    if (dto.threshold_high !== undefined) updateData.thresholdHigh = dto.threshold_high;
    const beforeUpdate = await this.findOne(id);
    await this.tankRepo.update(id, updateData);

    await this.audit.logAudit(
      userId,
      'UPDATE_TANK',
      'Tank',
      id,
      beforeUpdate, //
      dto,
      dto.reason ?? null,
      ip,
    );

    return { message: 'Tank berhasil diperbarui' };
  }
}
