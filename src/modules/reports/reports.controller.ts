import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('report.view')
@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('transactions')
  @ApiOperation({ summary: 'Get transactions report with aggregate summary' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'unit_id', required: false })
  @ApiQuery({ name: 'product_id', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getTransactionsReport(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('unit_id') unitId?: string,
    @Query('product_id') productId?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.reportsService.getTransactionsReport(
      from,
      to,
      unitId,
      productId,
      limit ? Number(limit) : 500,
    );
    return { success: true, ...result };
  }

  @Get('quota')
  @ApiOperation({ summary: 'Get quota report with allocation and usage summary' })
  @ApiQuery({ name: 'period_id', required: false })
  async getQuotaReport(@Query('period_id') periodId?: string) {
    const result = await this.reportsService.getQuotaReport(periodId);
    return { success: true, ...result };
  }

  @Get('stock')
  @ApiOperation({ summary: 'Get stock reconciliation history report' })
  async getStockReport() {
    const data = await this.reportsService.getStockReport();
    return { success: true, data };
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get fuel consumption breakdown by unit and card' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async getUsageReport(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const data = await this.reportsService.getUsageReport(from, to);
    return { success: true, data };
  }

  @Get('totalizer')
  @ApiOperation({ summary: 'Get dispenser totalizer audit report' })
  async getTotalizerReport() {
    const data = await this.reportsService.getTotalizerReport();
    return { success: true, data };
  }

  @Get('executive')
  @ApiOperation({ summary: 'Get executive monthly KPI and variance overview' })
  @ApiQuery({ name: 'month', required: false })
  @ApiQuery({ name: 'year', required: false })
  async getExecutiveReport(
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const data = await this.reportsService.getExecutiveReport(month, year);
    return { success: true, data };
  }
}
