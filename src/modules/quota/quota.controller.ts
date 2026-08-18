import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Ip,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { QuotaService } from './quota.service';
import { GenerateQuotaDto } from './dto/generate-quota.dto';
import { TopupQuotaDto } from './dto/topup-quota.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Quota')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/quota')
export class QuotaController {
  constructor(private readonly quotaService: QuotaService) {}

  @Get()
  @RequirePermissions('quota.view')
  @ApiOperation({ summary: 'List all card quotas for active/specified period' })
  @ApiQuery({ name: 'period_id', required: false })
  @ApiQuery({ name: 'card_id', required: false })
  @ApiQuery({ name: 'unit_id', required: false })
  async findAll(
    @Query('period_id') period_id?: string,
    @Query('card_id') card_id?: string,
    @Query('unit_id') unit_id?: string,
  ) {
    const data = await this.quotaService.findAll(period_id, card_id, unit_id);
    return { success: true, data };
  }

  @Get('periods')
  @RequirePermissions('quota.view')
  @ApiOperation({ summary: 'List all quota periods' })
  async findPeriods() {
    const data = await this.quotaService.findPeriods();
    return { success: true, data };
  }

  @Get('ledger/:cardId')
  @RequirePermissions('quota.view')
  @ApiOperation({ summary: 'Get quota ledger for a card' })
  async findLedger(@Param('cardId') cardId: string) {
    const data = await this.quotaService.findLedger(cardId);
    return { success: true, data };
  }

  @Post('generate')
  @RequirePermissions('quota.generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk generate monthly quotas' })
  async generate(
    @Body() dto: GenerateQuotaDto,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.quotaService.generate(dto, userId, ip);
    return { success: true, data };
  }

  @Post('topup')
  @RequirePermissions('quota.topup')
  @ApiOperation({ summary: 'Top up card quota' })
  async topup(
    @Body() dto: TopupQuotaDto,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.quotaService.topup(dto, userId, ip);
    return { success: true, data };
  }
}
