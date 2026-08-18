import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { FmsService } from './fms.service';
import { FmsTestConnectionDto } from './dto/fms-config.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('FMS')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/fms')
export class FmsController {
  constructor(private readonly fmsService: FmsService) {}

  /**
   * Test connectivity and handshake latency against the Pertamina Forecourt Controller.
   * Can test active database/env config or a custom target URL provided in the payload.
   */
  @Post('test-connection')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('system.manage')
  @ApiOperation({
    summary: 'Test connection to Pertamina Forecourt Controller',
    description:
      'Performs an Acknowledge handshake ping against the target Forecourt Controller URL and returns connection status, latency (ms), and controller metadata.',
  })
  @ApiResponse({
    status: 200,
    description: 'Connection test completed successfully or reported connection status',
  })
  async testConnection(@Body() dto?: FmsTestConnectionDto) {
    const data = await this.fmsService.testConnection(dto);
    return {
      success: data.success,
      data,
    };
  }

  /**
   * Quick GET shortcut for connection test against active configuration
   */
  @Get('test-connection')
  @RequirePermissions('system.manage')
  @ApiOperation({
    summary: 'Quick test connection to active Forecourt Controller (GET)',
  })
  async testConnectionGet() {
    const data = await this.fmsService.testConnection();
    return {
      success: data.success,
      data,
    };
  }
}
