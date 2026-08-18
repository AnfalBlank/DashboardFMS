import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get main dashboard KPI summary' })
  async getSummary() {
    const data = await this.dashboardService.getSummary();
    return { success: true, data };
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get active dashboard alerts' })
  async getAlerts() {
    const data = await this.dashboardService.getAlerts();
    return { success: true, data };
  }

  @Post('alerts/:id/read')
  @ApiOperation({ summary: 'Mark alert as read' })
  async readAlert(@Param('id') id: string) {
    await this.dashboardService.readAlert(id);
    return { success: true };
  }
}
