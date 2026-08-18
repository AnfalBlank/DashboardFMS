import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Ip,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Stock')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  @RequirePermissions('stock.view')
  @ApiOperation({ summary: 'Get current stock summary per product' })
  async getStockSummary() {
    const data = await this.stockService.getStockSummary();
    return { success: true, data };
  }

  @Get('movements')
  @RequirePermissions('stock.view')
  @ApiOperation({ summary: 'Get stock movements log' })
  @ApiQuery({ name: 'product_id', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getMovements(
    @Query('product_id') productId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.stockService.getMovements(
      productId,
      from,
      to,
      limit ? Number(limit) : 50,
    );
    return { success: true, data };
  }

  @Get('deliveries')
  @RequirePermissions('stock.view')
  @ApiOperation({ summary: 'Get fuel deliveries history' })
  async getDeliveries() {
    const data = await this.stockService.getDeliveries();
    return { success: true, data };
  }

  @Post('deliveries')
  @RequirePermissions('stock.view')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record and confirm fuel delivery' })
  async createDelivery(
    @Body() dto: CreateDeliveryDto,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.stockService.createDelivery(dto, userId, ip);
    return { success: true, data };
  }

  @Post('adjustment')
  @RequirePermissions('stock.adjust')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record manual stock adjustment' })
  async adjustStock(
    @Body() dto: StockAdjustmentDto,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.stockService.adjustStock(dto, userId, ip);
    return { success: true, data };
  }
}
