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
import { TanksService } from './tanks.service';
import { TankReadingDto } from './dto/tank-reading.dto';
import { UpdateTankDto } from './dto/update-tank.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tanks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/tanks')
export class TanksController {
  constructor(private readonly tanksService: TanksService) {}

  @Get()
  @RequirePermissions('stock.view')
  @ApiOperation({ summary: 'List all storage tanks' })
  async findAll() {
    const data = await this.tanksService.findAll();
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions('stock.view')
  @ApiOperation({ summary: 'Get tank details by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.tanksService.findOne(id);
    return { success: true, data };
  }

  @Get(':id/readings')
  @RequirePermissions('stock.view')
  @ApiOperation({ summary: 'Get readings history for a tank' })
  @ApiQuery({ name: 'limit', required: false })
  async findReadings(@Param('id') id: string, @Query('limit') limit?: string) {
    const data = await this.tanksService.findReadings(
      id,
      limit ? Number(limit) : 50,
    );
    return { success: true, data };
  }

  @Post(':id/readings')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Push sensor reading or manual tank reading' })
  async addReading(
    @Param('id') id: string,
    @Body() dto: TankReadingDto,
    @CurrentUser('userId') userId?: string,
  ) {
    const data = await this.tanksService.addReading(id, dto, userId);
    return { success: true, data };
  }

  @Put(':id')
  @RequirePermissions('stock.adjust')
  @ApiOperation({ summary: 'Update tank current stock or thresholds' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTankDto,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.tanksService.update(id, dto, userId, ip);
    return { success: true, ...data };
  }
}
