import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PumpsService } from './pumps.service';
import { TotalizerReadingDto } from './dto/totalizer-reading.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Pumps')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/pumps')
export class PumpsController {
  constructor(private readonly pumpsService: PumpsService) {}

  @Get()
  @RequirePermissions('transaction.view')
  @ApiOperation({ summary: 'List all pumps' })
  async getPumps() {
    const data = await this.pumpsService.getPumps();
    return { success: true, data };
  }

  @Get('nozzles')
  @RequirePermissions('transaction.view')
  @ApiOperation({ summary: 'List all nozzles' })
  async getNozzles() {
    const data = await this.pumpsService.getNozzles();
    return { success: true, data };
  }

  @Get('totalizers')
  @RequirePermissions('transaction.view')
  @ApiOperation({ summary: 'Get totalizer readings with system reconciliation' })
  @ApiQuery({ name: 'date', required: false })
  async getTotalizers(@Query('date') date?: string) {
    const data = await this.pumpsService.getTotalizers(date);
    return { success: true, data };
  }

  @Post('totalizers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Push totalizer reading from controller or manual' })
  async saveTotalizer(@Body() dto: TotalizerReadingDto) {
    const data = await this.pumpsService.saveTotalizer(dto);
    return { success: true, data };
  }

  @Get('reconciliation')
  @RequirePermissions('transaction.view')
  @ApiOperation({ summary: 'Get pump dispenser reconciliation' })
  @ApiQuery({ name: 'date', required: false })
  async getPumpReconciliation(@Query('date') date?: string) {
    const data = await this.pumpsService.getPumpReconciliation(date);
    return { success: true, data };
  }
}

@ApiTags('Nozzles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/nozzles')
export class NozzlesController {
  constructor(private readonly pumpsService: PumpsService) {}

  @Get()
  @RequirePermissions('transaction.view')
  @ApiOperation({ summary: 'List all nozzles' })
  async getNozzles() {
    const data = await this.pumpsService.getNozzles();
    return { success: true, data };
  }
}
