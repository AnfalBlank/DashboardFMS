import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  Tank,
  StockMovement,
  Delivery,
} from '../../database/entities';
import { AuditService } from '../audit/audit.service';
import { v4 as uuid } from 'uuid';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';
import { toNum } from '../../common/utils/db.util';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Tank)
    private readonly tankRepo: Repository<Tank>,
    @InjectRepository(StockMovement)
    private readonly stockMovementRepo: Repository<StockMovement>,
    @InjectRepository(Delivery)
    private readonly deliveryRepo: Repository<Delivery>,
    private readonly dataSource: DataSource,
    private readonly audit: AuditService,
  ) {}

  async getStockSummary() {
    const rows = await this.tankRepo
      .createQueryBuilder('t')
      .innerJoin('t.product', 'p')
      .select([
        't.product_id AS product_id',
        'p.name AS product_name',
        'p.code AS code',
        'SUM(t.capacity_l) AS total_capacity',
        'SUM(t.current_l) AS total_current',
        'MIN(t.status) AS worst_status',
      ])
      .groupBy('t.product_id, p.name, p.code')
      .orderBy('p.name', 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      product_id: r.product_id,
      product_name: r.product_name,
      code: r.code,
      total_capacity: toNum(r.total_capacity),
      total_current: toNum(r.total_current),
      worst_status: r.worst_status,
    }));
  }

  async getMovements(
    productId?: string,
    from?: string,
    to?: string,
    limit: number = 50,
  ) {
    const qb = this.stockMovementRepo
      .createQueryBuilder('sm')
      .innerJoinAndSelect('sm.product', 'p');

    if (productId) {
      qb.andWhere('sm.productId = :productId', { productId });
    }
    if (from) {
      qb.andWhere('sm.createdAt >= :from', { from });
    }
    if (to) {
      qb.andWhere('sm.createdAt <= :to', { to: to + ' 23:59:59' });
    }

    qb.orderBy('sm.createdAt', 'DESC').take(Number(limit));

    const list = await qb.getMany();

    return list.map((sm) => ({
      id: sm.id,
      product_id: sm.productId,
      product_name: sm.product?.name,
      tank_id: sm.tankId,
      type: sm.type,
      quantity_l: toNum(sm.quantityL),
      balance_l: toNum(sm.balanceL),
      ref_id: sm.refId,
      notes: sm.notes,
      approved_by: sm.approvedBy,
      created_by: sm.createdBy,
      created_at: sm.createdAt,
    }));
  }

  async getDeliveries() {
    const list = await this.deliveryRepo
      .createQueryBuilder('d')
      .innerJoinAndSelect('d.product', 'p')
      .leftJoinAndSelect('d.tank', 't')
      .orderBy('d.createdAt', 'DESC')
      .take(100)
      .getMany();

    return list.map((d) => ({
      id: d.id,
      date: d.date,
      supplier: d.supplier,
      product_id: d.productId,
      product_name: d.product?.name,
      quantity_l: toNum(d.quantityL),
      tank_id: d.tankId,
      tank_capacity: toNum(d.tank?.capacityL),
      doc_number: d.docNumber,
      delivery_note: d.deliveryNote,
      status: d.status,
      confirmed_by: d.confirmedBy,
      confirmed_at: d.confirmedAt,
      created_by: d.createdBy,
      created_at: d.createdAt,
    }));
  }

  async createDelivery(dto: CreateDeliveryDto, userId: string, ip?: string) {
    const id = uuid();

    await this.dataSource.transaction(async (em) => {
      const delivery = em.create(Delivery, {
        id,
        date: dto.date,
        supplier: dto.supplier,
        productId: dto.product_id,
        quantityL: dto.quantity_l,
        tankId: dto.tank_id ?? undefined,
        docNumber: dto.doc_number ?? undefined,
        deliveryNote: dto.delivery_note ?? undefined,
        createdBy: userId,
        status: dto.tank_id ? 'CONFIRMED' : 'PENDING',
        confirmedBy: dto.tank_id ? userId : undefined,
        confirmedAt: dto.tank_id ? new Date() : undefined,
      });
      await em.save(Delivery, delivery);

      if (dto.tank_id) {
        await em
          .createQueryBuilder()
          .update(Tank)
          .set({
            currentL: () => `current_l + ${dto.quantity_l}`,
          })
          .where('id = :id', { id: dto.tank_id })
          .execute();

        const updatedTank = await em.findOne(Tank, { where: { id: dto.tank_id } });
        const newBalance = toNum(updatedTank?.currentL);

        const movement = em.create(StockMovement, {
          id: uuid(),
          productId: dto.product_id,
          tankId: dto.tank_id,
          type: 'DELIVERY',
          quantityL: dto.quantity_l,
          balanceL: newBalance,
          refId: id,
          notes: dto.delivery_note ?? undefined,
          createdBy: userId,
        });
        await em.save(StockMovement, movement);
      }
    });

    await this.audit.logAudit(
      userId,
      'CREATE_DELIVERY',
      'Stock',
      id,
      null,
      dto,
      null,
      ip,
    );

    return { id };
  }

  async adjustStock(dto: StockAdjustmentDto, userId: string, ip?: string) {
    const mvId = uuid();
    let newBalance = 0;

    await this.dataSource.transaction(async (em) => {
      if (dto.tank_id) {
        await em
          .createQueryBuilder()
          .update(Tank)
          .set({
            currentL: () => `GREATEST(0, current_l + ${dto.delta_l})`,
          })
          .where('id = :id', { id: dto.tank_id })
          .execute();

        const updatedTank = await em.findOne(Tank, { where: { id: dto.tank_id } });
        newBalance = toNum(updatedTank?.currentL);
      }

      const movement = em.create(StockMovement, {
        id: mvId,
        productId: dto.product_id,
        tankId: dto.tank_id ?? undefined,
        type: 'ADJUSTMENT',
        quantityL: dto.delta_l,
        balanceL: newBalance,
        notes: dto.reason,
        createdBy: userId,
      });
      await em.save(StockMovement, movement);
    });

    await this.audit.logAudit(
      userId,
      'STOCK_ADJUSTMENT',
      'Stock',
      mvId,
      null,
      { delta: dto.delta_l, reason: dto.reason },
      dto.reason,
      ip,
    );

    return { movement_id: mvId, new_balance_l: newBalance };
  }
}
