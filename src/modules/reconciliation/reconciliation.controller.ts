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
import { ReconciliationService } from './reconciliation.service';
import { RunReconciliationDto } from './dto/run-reconciliation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Reconciliation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/reconciliation')
export class ReconciliationController {
  constructor(private readonly reconciliationService: ReconciliationService) {}

  @Get()
  @RequirePermissions('stock.view')
  @ApiOperation({ summary: 'Get daily reconciliation results' })
  @ApiQuery({ name: 'date', required: false })
  async getReconciliations(@Query('date') date?: string) {
    const data = await this.reconciliationService.getReconciliations(date);
    return { success: true, data };
  }

  @Post('run')
  @RequirePermissions('stock.view')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate and run daily reconciliation' })
  async runReconciliation(
    @Body() dto: RunReconciliationDto,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.reconciliationService.runReconciliation(
      dto.date,
      userId,
      ip,
    );
    return { success: true, data };
  }
}
