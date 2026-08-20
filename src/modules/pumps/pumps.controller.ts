import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Ip,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PumpsService } from './pumps.service';
import { CreatePumpDto } from './dto/create-pump.dto';
import { UpdatePumpDto } from './dto/update-pump.dto';
import { CreateNozzleDto } from './dto/create-nozzle.dto';
import { UpdateNozzleDto } from './dto/update-nozzle.dto';
import { TotalizerReadingDto } from './dto/totalizer-reading.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

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

  @Post()
  @RequirePermissions('system.manage')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new pump dispenser' })
  async createPump(
    @Body() dto: CreatePumpDto,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.pumpsService.createPump(dto, userId, ip);
    return { success: true, data };
  }

  @Get('nozzles')
  @RequirePermissions('transaction.view')
  @ApiOperation({ summary: 'List all nozzles (legacy route)' })
  async getNozzlesLegacy() {
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

  @Get(':id')
  @RequirePermissions('transaction.view')
  @ApiOperation({ summary: 'Get pump dispenser details by ID' })
  async getPump(@Param('id') id: string) {
    const data = await this.pumpsService.getPump(id);
    return { success: true, data };
  }

  @Put(':id')
  @RequirePermissions('system.manage')
  @ApiOperation({ summary: 'Update pump dispenser details' })
  async updatePump(
    @Param('id') id: string,
    @Body() dto: UpdatePumpDto,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.pumpsService.updatePump(id, dto, userId, ip);
    return { success: true, ...data };
  }

  @Delete(':id')
  @RequirePermissions('system.manage')
  @ApiOperation({ summary: 'Delete pump dispenser' })
  async deletePump(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.pumpsService.deletePump(id, userId, ip);
    return { success: true, ...data };
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

  @Post()
  @RequirePermissions('system.manage')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new nozzle' })
  async createNozzle(
    @Body() dto: CreateNozzleDto,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.pumpsService.createNozzle(dto, userId, ip);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions('transaction.view')
  @ApiOperation({ summary: 'Get nozzle details by ID' })
  async getNozzle(@Param('id') id: string) {
    const data = await this.pumpsService.getNozzle(id);
    return { success: true, data };
  }

  @Put(':id')
  @RequirePermissions('system.manage')
  @ApiOperation({ summary: 'Update nozzle details' })
  async updateNozzle(
    @Param('id') id: string,
    @Body() dto: UpdateNozzleDto,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.pumpsService.updateNozzle(id, dto, userId, ip);
    return { success: true, ...data };
  }

  @Delete(':id')
  @RequirePermissions('system.manage')
  @ApiOperation({ summary: 'Delete nozzle' })
  async deleteNozzle(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.pumpsService.deleteNozzle(id, userId, ip);
    return { success: true, ...data };
  }
}
