import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Tank,
  TankReading,
  Product,
  Notification,
} from '../../database/entities';
import { AuditService } from '../audit/audit.service';
import { toNum } from '../../common/utils/db.util';
import { v4 as uuid } from 'uuid';
import { CreateTankDto } from './dto/create-tank.dto';
import { UpdateTankDto } from './dto/update-tank.dto';
import { TankReadingDto } from './dto/tank-reading.dto';

@Injectable()
export class TanksService {
  constructor(
    @InjectRepository(Tank)
    private readonly tankRepo: Repository<Tank>,
    @InjectRepository(TankReading)
    private readonly tankReadingRepo: Repository<TankReading>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly audit: AuditService,
  ) {}

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
      oil_color: t.oilColor || 'blue',
      water_color: t.waterColor || 'blue',
      active: t.active !== undefined ? Number(t.active) : 1,
      id_port: t.idPort !== undefined && t.idPort !== null ? Number(t.idPort) : null,
      id_polling: t.idPolling !== undefined && t.idPolling !== null ? Number(t.idPolling) : null,
      id_tank_enabler: t.idTankEnabler !== undefined && t.idTankEnabler !== null ? Number(t.idTankEnabler) : null,
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
      product_code: t.product?.code,
      capacity_l: toNum(t.capacityL),
      current_l: toNum(t.currentL),
      status: t.status,
      oil_color: t.oilColor || 'blue',
      water_color: t.waterColor || 'blue',
      active: t.active !== undefined ? Number(t.active) : 1,
      id_port: t.idPort !== undefined && t.idPort !== null ? Number(t.idPort) : null,
      id_polling: t.idPolling !== undefined && t.idPolling !== null ? Number(t.idPolling) : null,
      id_tank_enabler: t.idTankEnabler !== undefined && t.idTankEnabler !== null ? Number(t.idTankEnabler) : null,
      threshold_low: toNum(t.thresholdLow),
      threshold_critical: toNum(t.thresholdCritical),
      threshold_high: toNum(t.thresholdHigh),
      last_reading_at: t.lastReadingAt,
      created_at: t.createdAt,
      updated_at: t.updatedAt,
    };
  }

  async create(dto: CreateTankDto, userId?: string, ip?: string) {
    const product = await this.productRepo.findOneBy({ id: dto.product_id });
    if (!product) {
      throw new NotFoundException({
        success: false,
        message: `Produk BBM dengan ID '${dto.product_id}' tidak ditemukan`,
      });
    }

    let tankId = dto.id?.trim();
    if (tankId) {
      const existing = await this.tankRepo.findOneBy({ id: tankId });
      if (existing) {
        throw new ConflictException({
          success: false,
          message: `Tangki dengan ID '${tankId}' sudah terdaftar`,
        });
      }
    } else {
      const count = await this.tankRepo.count();
      tankId = `TANK-${String(count + 1).padStart(2, '0')}`;
    }

    const capacityL = Number(dto.capacity_l);
    const currentL = dto.current_l !== undefined ? Number(dto.current_l) : 0;
    const thresholdLow = dto.threshold_low !== undefined ? Number(dto.threshold_low) : 30;
    const thresholdCritical = dto.threshold_critical !== undefined ? Number(dto.threshold_critical) : 15;
    const thresholdHigh = dto.threshold_high !== undefined ? Number(dto.threshold_high) : 90;

    let status = dto.status;
    if (!status) {
      const pct = (currentL / Math.max(capacityL, 1)) * 100;
      status =
        pct <= thresholdCritical
          ? 'CRITICAL'
          : pct <= thresholdLow
            ? 'LOW'
            : pct >= thresholdHigh
              ? 'HIGH'
              : 'NORMAL';
    }

    const tank = this.tankRepo.create({
      id: tankId,
      productId: dto.product_id,
      capacityL,
      currentL,
      status,
      oilColor: dto.oil_color || 'blue',
      waterColor: dto.water_color || 'blue',
      active: dto.active !== undefined ? Number(dto.active) : 1,
      idPort: dto.id_port !== undefined && dto.id_port !== null ? Number(dto.id_port) : undefined,
      idPolling: dto.id_polling !== undefined && dto.id_polling !== null ? Number(dto.id_polling) : undefined,
      idTankEnabler: dto.id_tank_enabler !== undefined && dto.id_tank_enabler !== null ? Number(dto.id_tank_enabler) : undefined,
      thresholdLow,
      thresholdCritical,
      thresholdHigh,
      lastReadingAt: new Date(),
    });

    await this.tankRepo.save(tank);

    await this.audit.logAudit(
      userId,
      'CREATE_TANK',
      'Tank',
      tankId,
      null,
      {
        id: tankId,
        product_id: dto.product_id,
        capacity_l: capacityL,
        current_l: currentL,
        status,
        oil_color: dto.oil_color || 'blue',
        water_color: dto.water_color || 'blue',
        active: dto.active !== undefined ? Number(dto.active) : 1,
        id_port: dto.id_port,
        id_polling: dto.id_polling,
        id_tank_enabler: dto.id_tank_enabler,
        threshold_low: thresholdLow,
        threshold_critical: thresholdCritical,
        threshold_high: thresholdHigh,
      },
      'Registrasi tangki pendam baru',
      ip,
    );

    return this.findOne(tankId);
  }

  async update(id: string, dto: UpdateTankDto, userId?: string, ip?: string) {
    const beforeUpdate = await this.findOne(id);

    const updateData: Partial<Tank> = {};

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

    if (dto.capacity_l !== undefined) updateData.capacityL = Number(dto.capacity_l);
    if (dto.current_l !== undefined) updateData.currentL = Number(dto.current_l);
    if (dto.threshold_low !== undefined) updateData.thresholdLow = Number(dto.threshold_low);
    if (dto.threshold_critical !== undefined) updateData.thresholdCritical = Number(dto.threshold_critical);
    if (dto.threshold_high !== undefined) updateData.thresholdHigh = Number(dto.threshold_high);

    if (dto.oil_color !== undefined) updateData.oilColor = dto.oil_color;
    if (dto.water_color !== undefined) updateData.waterColor = dto.water_color;
    if (dto.active !== undefined) updateData.active = Number(dto.active);
    if (dto.id_port !== undefined) updateData.idPort = dto.id_port !== null ? Number(dto.id_port) : undefined;
    if (dto.id_polling !== undefined) updateData.idPolling = dto.id_polling !== null ? Number(dto.id_polling) : undefined;
    if (dto.id_tank_enabler !== undefined) updateData.idTankEnabler = dto.id_tank_enabler !== null ? Number(dto.id_tank_enabler) : undefined;

    if (dto.status) {
      updateData.status = dto.status;
    } else if (dto.current_l !== undefined || dto.capacity_l !== undefined || dto.threshold_critical !== undefined || dto.threshold_low !== undefined) {
      const cur = dto.current_l !== undefined ? Number(dto.current_l) : beforeUpdate.current_l;
      const cap = dto.capacity_l !== undefined ? Number(dto.capacity_l) : beforeUpdate.capacity_l;
      const thCrit = dto.threshold_critical !== undefined ? Number(dto.threshold_critical) : beforeUpdate.threshold_critical;
      const thLow = dto.threshold_low !== undefined ? Number(dto.threshold_low) : beforeUpdate.threshold_low;
      const thHigh = dto.threshold_high !== undefined ? Number(dto.threshold_high) : beforeUpdate.threshold_high;

      const pct = (cur / Math.max(cap, 1)) * 100;
      updateData.status =
        pct <= thCrit
          ? 'CRITICAL'
          : pct <= thLow
            ? 'LOW'
            : pct >= thHigh
              ? 'HIGH'
              : 'NORMAL';
    }

    await this.tankRepo.update(id, updateData);

    await this.audit.logAudit(
      userId,
      'UPDATE_TANK',
      'Tank',
      id,
      beforeUpdate,
      dto,
      dto.reason ?? 'Perbaruan data tangki',
      ip,
    );

    const updated = await this.findOne(id);
    return { message: 'Tank berhasil diperbarui', data: updated };
  }

  async remove(id: string, userId?: string, ip?: string) {
    const beforeDelete = await this.findOne(id);

    // Delete associated readings if needed or delete tank
    await this.tankReadingRepo.delete({ tankId: id });
    await this.tankRepo.delete(id);

    await this.audit.logAudit(
      userId,
      'DELETE_TANK',
      'Tank',
      id,
      beforeDelete,
      null,
      'Hapus tangki pendam',
      ip,
    );

    return { success: true, message: `Tangki '${id}' berhasil dihapus` };
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
}
