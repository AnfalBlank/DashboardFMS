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
import { SystemService } from './system.service';
import { ApprovalActionDto } from './dto/approval-action.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('System')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  // ── Audit Log ──
  @Get('audit')
  @RequirePermissions('audit.view')
  @ApiOperation({ summary: 'List system audit trail logs' })
  @ApiQuery({ name: 'module', required: false })
  @ApiQuery({ name: 'user_id', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async getAuditLogs(
    @Query('module') module?: string,
    @Query('user_id') userId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const result = await this.systemService.getAuditLogs(
      module,
      userId,
      from,
      to,
      limit ? Number(limit) : 100,
      offset ? Number(offset) : 0,
    );
    return { success: true, ...result };
  }

  // ── Approvals ──
  @Get('approvals')
  @RequirePermissions('quota.approve')
  @ApiOperation({ summary: 'List approval requests' })
  @ApiQuery({ name: 'status', required: false })
  async getApprovals(@Query('status') status?: string) {
    const data = await this.systemService.getApprovals(status ?? 'PENDING');
    return { success: true, data };
  }

  @Post('approvals/:id/approve')
  @RequirePermissions('quota.approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve an approval request' })
  async approve(
    @Param('id') id: string,
    @Body() dto: ApprovalActionDto,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.systemService.approve(id, dto.note, userId, ip);
    return { success: true, ...data };
  }

  @Post('approvals/:id/reject')
  @RequirePermissions('quota.approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject an approval request' })
  async reject(
    @Param('id') id: string,
    @Body() dto: ApprovalActionDto,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.systemService.reject(id, dto.note, userId, ip);
    return { success: true, ...data };
  }

  // ── System Settings ──
  @Get('settings')
  @RequirePermissions('system.manage')
  @ApiOperation({ summary: 'Get all system settings key-value map' })
  async getSettings() {
    const data = await this.systemService.getSettings();
    return { success: true, data };
  }

  @Put('settings')
  @RequirePermissions('system.manage')
  @ApiOperation({ summary: 'Update system settings key-value pairs' })
  async updateSettings(
    @Body() updates: Record<string, string>,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.systemService.updateSettings(updates, userId, ip);
    return { success: true, ...data };
  }

  // ── Notifications ──
  @Get('notifications')
  @ApiOperation({ summary: 'Get recent system notifications' })
  async getNotifications() {
    const data = await this.systemService.getNotifications();
    return { success: true, data };
  }

  @Put('notifications/read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async readAllNotifications() {
    const data = await this.systemService.readAllNotifications();
    return data;
  }

  // ── Integration Monitor ──
  @Get('integration')
  @RequirePermissions('system.manage')
  @ApiOperation({ summary: 'Get controller sync integration status' })
  async getIntegrationStatus() {
    const data = await this.systemService.getIntegrationStatus();
    return { success: true, data };
  }
}
