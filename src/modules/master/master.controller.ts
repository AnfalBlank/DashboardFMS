import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  Ip,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MasterService } from './master.service';
import {
  CreateProductDto,
  CreatePriceDto,
  CreateVehicleDto,
  UpdateVehicleDto,
  CreateUnitDto,
  UpdateUnitDto,
} from './dto/master.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Master')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/master')
export class MasterController {
  constructor(private readonly masterService: MasterService) {}

  // ══════════════ PRODUCTS ══════════════

  @Get('products')
  @ApiOperation({ summary: 'List all fuel products' })
  async getProducts() {
    const data = await this.masterService.getProducts();
    return { success: true, data };
  }

  @Post('products')
  @RequirePermissions('system.manage')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new fuel product' })
  async createProduct(
    @Body() dto: CreateProductDto,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.masterService.createProduct(dto, userId, ip);
    return { success: true, data };
  }

  // ══════════════ PRICES ══════════════

  @Get('prices')
  @ApiOperation({ summary: 'Get fuel prices history' })
  async getPrices() {
    const data = await this.masterService.getPrices();
    return { success: true, data };
  }

  @Post('prices')
  @RequirePermissions('system.manage')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Update/create fuel price with effective date' })
  async createPrice(
    @Body() dto: CreatePriceDto,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.masterService.createPrice(dto, userId, ip);
    return { success: true, data };
  }

  // ══════════════ VEHICLES ══════════════

  @Get('vehicles')
  @RequirePermissions('card.view')
  @ApiOperation({ summary: 'List all vehicles' })
  @ApiQuery({ name: 'unit_id', required: false })
  async getVehicles(@Query('unit_id') unitId?: string) {
    const data = await this.masterService.getVehicles(unitId);
    return { success: true, data };
  }

  @Post('vehicles')
  @RequirePermissions('card.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new vehicle' })
  async createVehicle(
    @Body() dto: CreateVehicleDto,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.masterService.createVehicle(dto, userId, ip);
    return { success: true, data };
  }

  @Put('vehicles/:id')
  @RequirePermissions('card.edit')
  @ApiOperation({ summary: 'Update vehicle details' })
  async updateVehicle(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.masterService.updateVehicle(id, dto, userId, ip);
    return { success: true, ...data };
  }

  // ══════════════ UNITS ══════════════

  @Get('units')
  @ApiOperation({ summary: 'List all organization units/satker' })
  async getUnits() {
    const data = await this.masterService.getUnits();
    return { success: true, data };
  }

  @Post('units')
  @RequirePermissions('system.manage')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new organization unit' })
  async createUnit(
    @Body() dto: CreateUnitDto,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.masterService.createUnit(dto, userId, ip);
    return { success: true, data };
  }

  @Put('units/:id')
  @RequirePermissions('system.manage')
  @ApiOperation({ summary: 'Update organization unit' })
  async updateUnit(
    @Param('id') id: string,
    @Body() dto: UpdateUnitDto,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.masterService.updateUnit(id, dto, userId, ip);
    return { success: true, ...data };
  }

  // ══════════════ USERS, ROLES, PERMISSIONS ══════════════

  @Get('users')
  @RequirePermissions('user.manage')
  @ApiOperation({ summary: 'List all system users' })
  async getUsers() {
    const data = await this.masterService.getUsers();
    return { success: true, data };
  }

  @Get('roles')
  @RequirePermissions('user.manage')
  @ApiOperation({ summary: 'List all user roles' })
  async getRoles() {
    const data = await this.masterService.getRoles();
    return { success: true, data };
  }

  @Get('permissions')
  @RequirePermissions('user.manage')
  @ApiOperation({ summary: 'List all permissions' })
  async getPermissions() {
    const data = await this.masterService.getPermissions();
    return { success: true, data };
  }
}
