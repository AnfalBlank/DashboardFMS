import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Product,
  PriceHistory,
  Vehicle,
  Card,
  Unit,
  User,
  Role,
  Permission,
} from '../../database/entities';
import { AuditService } from '../audit/audit.service';
import { v4 as uuid } from 'uuid';
import {
  CreateProductDto,
  CreatePriceDto,
  CreateVehicleDto,
  UpdateVehicleDto,
  CreateUnitDto,
  UpdateUnitDto,
} from './dto/master.dto';
import { toNum } from '../../common/utils/db.util';

@Injectable()
export class MasterService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(PriceHistory)
    private readonly priceHistoryRepo: Repository<PriceHistory>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Card)
    private readonly cardRepo: Repository<Card>,
    @InjectRepository(Unit)
    private readonly unitRepo: Repository<Unit>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    private readonly audit: AuditService,
  ) {}

  // ══════════════ PRODUCTS ══════════════

  async getProducts() {
    const list = await this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.priceHistories', 'ph')
      .orderBy('p.name', 'ASC')
      .addOrderBy('ph.effectiveDate', 'DESC')
      .getMany();

    return list.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      type: p.type,
      unit: p.unit,
      active: p.active,
      current_price: toNum(p.priceHistories?.[0]?.pricePerUnit, 0),
      created_at: p.createdAt,
    }));
  }

  async createProduct(dto: CreateProductDto, userId: string, ip?: string) {
    if (!dto.code || !dto.name || !dto.type) {
      throw new BadRequestException({
        success: false,
        message: 'code, name, type wajib diisi',
      });
    }

    const id = uuid();
    const product = this.productRepo.create({
      id,
      code: dto.code,
      name: dto.name,
      type: dto.type,
      unit: dto.unit ?? 'Liter',
    });
    await this.productRepo.save(product);

    await this.audit.logAudit(
      userId,
      'CREATE_PRODUCT',
      'Master',
      id,
      null,
      dto,
      null,
      ip,
    );

    return { id };
  }

  // ══════════════ PRICES ══════════════

  async getPrices() {
    const list = await this.priceHistoryRepo
      .createQueryBuilder('ph')
      .innerJoinAndSelect('ph.product', 'p')
      .orderBy('p.name', 'ASC')
      .addOrderBy('ph.effectiveDate', 'DESC')
      .getMany();

    return list.map((ph) => ({
      id: ph.id,
      product_id: ph.productId,
      product_name: ph.product?.name,
      code: ph.product?.code,
      price_per_unit: toNum(ph.pricePerUnit),
      effective_date: ph.effectiveDate,
      created_by: ph.createdBy,
      created_at: ph.createdAt,
    }));
  }

  async createPrice(dto: CreatePriceDto, userId: string, ip?: string) {
    const id = uuid();
    const prev = await this.priceHistoryRepo
      .createQueryBuilder('ph')
      .where('ph.productId = :productId', { productId: dto.product_id })
      .orderBy('ph.effectiveDate', 'DESC')
      .getOne();

    const price = this.priceHistoryRepo.create({
      id,
      productId: dto.product_id,
      pricePerUnit: dto.price_per_unit,
      effectiveDate: dto.effective_date,
      createdBy: userId,
    });
    await this.priceHistoryRepo.save(price);

    await this.audit.logAudit(
      userId,
      'PRICE_CHANGE',
      'Master',
      dto.product_id,
      { price: toNum(prev?.pricePerUnit) },
      { price: dto.price_per_unit, effective: dto.effective_date },
      null,
      ip,
    );

    return { id };
  }

  // ══════════════ VEHICLES ══════════════

  async getVehicles(unitId?: string) {
    const qb = this.vehicleRepo
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.unit', 'u')
      .leftJoinAndSelect('v.product', 'p');

    if (unitId) {
      qb.where('v.unitId = :unitId', { unitId });
    }

    qb.orderBy('v.policeNumber', 'ASC');

    const list = await qb.getMany();

    return list.map((v) => ({
      id: v.id,
      police_number: v.policeNumber,
      type: v.type,
      brand: v.brand,
      model: v.model,
      year: v.year,
      unit_id: v.unitId,
      unit_name: v.unit?.name,
      product_id: v.productId,
      product_name: v.product?.name,
      product_code: v.product?.code,
      fuel_type: v.product?.name ?? v.fuelType,
      status: v.status,
      notes: v.notes,
      created_at: v.createdAt,
    }));
  }

  async createVehicle(dto: CreateVehicleDto, userId: string, ip?: string) {
    const id = uuid();
    let productId = dto.product_id ?? undefined;
    let fuelType = dto.fuel_type ?? undefined;

    if (productId) {
      const prod = await this.productRepo.findOneBy({ id: productId });
      if (prod) {
        fuelType = prod.name;
      }
    } else if (fuelType) {
      const prod = await this.productRepo
        .createQueryBuilder('p')
        .where('p.code = :val OR p.name = :val OR p.id = :val', { val: fuelType })
        .getOne();
      if (prod) {
        productId = prod.id;
        fuelType = prod.name;
      }
    }

    const veh = this.vehicleRepo.create({
      id,
      policeNumber: dto.police_number,
      type: dto.type ?? undefined,
      brand: dto.brand ?? undefined,
      model: dto.model ?? undefined,
      year: dto.year ?? undefined,
      unitId: dto.unit_id ?? undefined,
      productId,
      fuelType,
      notes: dto.notes ?? undefined,
    });
    await this.vehicleRepo.save(veh);

    await this.audit.logAudit(
      userId,
      'CREATE_VEHICLE',
      'Master',
      id,
      null,
      dto,
      null,
      ip,
    );

    return { id };
  }

  async updateVehicle(id: string, dto: UpdateVehicleDto, userId: string, ip?: string) {
    const updateData: Partial<Vehicle> = {};
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.brand !== undefined) updateData.brand = dto.brand;
    if (dto.model !== undefined) updateData.model = dto.model;
    if (dto.year !== undefined) updateData.year = dto.year;
    if (dto.unit_id !== undefined) updateData.unitId = dto.unit_id;
    if (dto.status !== undefined) updateData.status = dto.status as any;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    let syncedFuelType: string | undefined = undefined;

    if (dto.product_id !== undefined) {
      updateData.productId = dto.product_id;
      if (dto.product_id) {
        const prod = await this.productRepo.findOneBy({ id: dto.product_id });
        if (prod) {
          updateData.fuelType = prod.name;
          syncedFuelType = prod.name;
        }
      }
    }

    if (dto.fuel_type !== undefined && updateData.fuelType === undefined) {
      updateData.fuelType = dto.fuel_type;
      syncedFuelType = dto.fuel_type;
      const prod = await this.productRepo
        .createQueryBuilder('p')
        .where('p.code = :val OR p.name = :val OR p.id = :val', { val: dto.fuel_type })
        .getOne();
      if (prod) {
        updateData.productId = prod.id;
        updateData.fuelType = prod.name;
        syncedFuelType = prod.name;
      }
    }

    await this.vehicleRepo.update(id, updateData);

    // Cascade sync card fuelType for cards associated with this vehicle
    if (syncedFuelType !== undefined) {
      await this.cardRepo.update({ vehicleId: id }, { fuelType: syncedFuelType });
    }

    await this.audit.logAudit(
      userId,
      'UPDATE_VEHICLE',
      'Master',
      id,
      null,
      dto,
      null,
      ip,
    );

    return { message: 'Kendaraan diperbarui' };
  }

  // ══════════════ UNITS ══════════════

  async getUnits() {
    const list = await this.unitRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.cards', 'c', "c.status = 'ACTIVE'")
      .leftJoinAndSelect('u.vehicles', 'v', "v.status = 'ACTIVE'")
      .orderBy('u.name', 'ASC')
      .getMany();

    return list.map((u) => ({
      id: u.id,
      code: u.code,
      name: u.name,
      parent_id: u.parentId,
      commander: u.commander,
      status: u.status,
      default_alloc_l: toNum(u.defaultAllocL),
      active_cards: u.cards?.length ?? 0,
      active_vehicles: u.vehicles?.length ?? 0,
      created_at: u.createdAt,
    }));
  }

  async createUnit(dto: CreateUnitDto, userId: string, ip?: string) {
    const id = uuid();
    const unit = this.unitRepo.create({
      id,
      code: dto.code,
      name: dto.name,
      parentId: dto.parent_id ?? undefined,
      commander: dto.commander ?? undefined,
      defaultAllocL: dto.default_alloc_l ?? 200,
    });
    await this.unitRepo.save(unit);

    await this.audit.logAudit(
      userId,
      'CREATE_UNIT',
      'Master',
      id,
      null,
      dto,
      null,
      ip,
    );

    return { id };
  }

  async updateUnit(id: string, dto: UpdateUnitDto, userId: string, ip?: string) {
    const updateData: Partial<Unit> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.commander !== undefined) updateData.commander = dto.commander;
    if (dto.default_alloc_l !== undefined) updateData.defaultAllocL = dto.default_alloc_l;
    if (dto.status !== undefined) updateData.status = dto.status;

    await this.unitRepo.update(id, updateData);

    await this.audit.logAudit(
      userId,
      'UPDATE_UNIT',
      'Master',
      id,
      null,
      dto,
      null,
      ip,
    );

    return { message: 'Unit diperbarui' };
  }

  // ══════════════ USERS & ROLES ══════════════

  async getUsers() {
    const list = await this.userRepo
      .createQueryBuilder('u')
      .innerJoinAndSelect('u.role', 'r')
      .leftJoinAndSelect('u.unit', 'un')
      .orderBy('u.name', 'ASC')
      .getMany();

    return list.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      role: u.role?.name,
      unit_id: u.unitId,
      unit_name: u.unit?.name,
      status: u.status,
      last_login: u.lastLogin,
      created_at: u.createdAt,
    }));
  }

  async getRoles() {
    return this.roleRepo.find({ order: { name: 'ASC' } });
  }

  async getPermissions() {
    return this.permissionRepo.find({ order: { module: 'ASC', action: 'ASC' } });
  }
}
